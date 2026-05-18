import re
from collections import defaultdict, deque
from dataclasses import dataclass
from io import BytesIO
from typing import Any


OCR_LANGUAGE = "rus"
OCR_FALLBACK_LANGUAGE = "rus_standard"
OCR_CONFIG = "--oem 1"

CHECKBOX_LABELS = {
    "smoker": ("курение",),
    "diabetes": ("диабет",),
    "hypertension": ("гипертония",),
    "heart_disease": ("болезни", "сердца"),
    "asthma": ("астма",),
}

FIELD_LABELS = {
    "full_name": "ФИО пациента",
    "snils": "СНИЛС",
    "address": "Адрес",
    "phone": "Телефон",
    "age": "Возраст",
    "gender": "Пол",
    "bmi": "BMI",
    "smoker": "Курение",
    "diabetes": "Диабет",
    "hypertension": "Гипертония",
    "heart_disease": "Болезни сердца",
    "asthma": "Астма",
    "physical_activity_level": "Уровень физической активности",
    "daily_steps": "Шагов в день",
    "sleep_hours": "Часы сна",
    "stress_level": "Уровень стресса",
    "doctor_visits_per_year": "Визитов к врачу в год",
    "hospital_admissions": "Госпитализаций",
    "medication_count": "Количество лекарств",
    "city_type": "Тип населённого пункта",
    "previous_year_cost": "Расходы за прошлый год",
}

INT_FIELD_RANGES = {
    "age": (18, 100),
    "daily_steps": (0, 50000),
    "stress_level": (1, 10),
    "doctor_visits_per_year": (0, 100),
    "hospital_admissions": (0, 50),
    "medication_count": (0, 100),
}

FLOAT_FIELD_RANGES = {
    "bmi": (10.0, 60.0),
    "sleep_hours": (0.0, 24.0),
    "previous_year_cost": (0.0, None),
}

BOOL_FIELDS = {"smoker", "diabetes", "hypertension", "heart_disease", "asthma"}
OPTIONAL_TEXT_FIELDS = {"snils", "address", "phone"}


@dataclass(frozen=True)
class Box:
    left: int
    top: int
    right: int
    bottom: int

    @property
    def width(self) -> int:
        return self.right - self.left

    @property
    def height(self) -> int:
        return self.bottom - self.top

    @property
    def center_x(self) -> float:
        return (self.left + self.right) / 2

    @property
    def center_y(self) -> float:
        return (self.top + self.bottom) / 2


@dataclass(frozen=True)
class OcrWord:
    text: str
    box: Box
    line_key: tuple[int, int, int]


@dataclass(frozen=True)
class OcrLine:
    text: str
    box: Box


def normalize_decimal(value: str) -> float:
    cleaned = value.replace(" ", "").replace(",", ".")
    return float(cleaned)


def normalize_int(value: str) -> int:
    return int(value.replace(" ", ""))


def _normalize_text(text: str) -> str:
    text = text.replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{2,}", "\n", text)
    return text.strip()


def _find_line_value(text: str, pattern: str) -> str | None:
    match = re.search(pattern, text, flags=re.IGNORECASE | re.MULTILINE)
    if not match:
        return None
    value = match.group(1).strip()
    value = re.sub(r"[_—-]{2,}.*$", "", value).strip()
    return value or None


def _clean_line_value(value: str) -> str:
    value = re.sub(r"[_—-]{2,}.*$", "", value).strip()
    return re.sub(r"\s+", " ", value).strip()


def _clean_name(value: str) -> str:
    value = re.sub(r"[^А-Яа-яЁё \-]", " ", value)
    return re.sub(r"\s+", " ", value).strip()


def _is_form_title(value: str) -> bool:
    return re.sub(r"[^а-яё]", "", value.casefold()) == "анкетапациента"


def _looks_like_label(value: str) -> bool:
    return bool(re.match(r"^\s*(?:\d+[\.,]\s*)?[А-Яа-яЁё ]{2,40}\s*:", value))


def _find_full_name(text: str) -> str | None:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    for index, line in enumerate(lines):
        if not re.search(r"ФИО\s+пациента", line, flags=re.IGNORECASE):
            continue

        _, _, after_colon = line.partition(":")
        candidates = [after_colon, *lines[index + 1 : index + 4]]
        for candidate in candidates:
            cleaned = _clean_name(candidate)
            if not cleaned or _is_form_title(cleaned) or _looks_like_label(candidate):
                continue
            return cleaned
    return None


def _normalize_snils(value: str) -> str | None:
    digits = re.sub(r"\D", "", value)
    if len(digits) != 11:
        return None
    return f"{digits[:3]}-{digits[3:6]}-{digits[6:9]} {digits[9:]}"


def _clean_address(value: str) -> str:
    return _clean_line_value(value)


def _normalize_phone(value: str) -> str | None:
    cleaned = re.sub(r"[^\d+]", "", value)
    if cleaned.startswith("+"):
        digits = re.sub(r"\D", "", cleaned[1:])
        return f"+{digits}" if digits else None
    digits = re.sub(r"\D", "", cleaned)
    return digits or None


def _normalize_gender(value: str) -> int | None:
    lowered = value.casefold()
    if "муж" in lowered:
        return 1
    if "жен" in lowered:
        return 0
    return None


def _normalize_activity(value: str) -> str | None:
    lowered = value.casefold()
    if "низ" in lowered:
        return "Low"
    if "сред" in lowered:
        return "Medium"
    if "выс" in lowered:
        return "High"
    return None


def _normalize_city_type(value: str) -> str | None:
    lowered = value.casefold()
    if "сел" in lowered or "сель" in lowered or "деревн" in lowered:
        return "Rural"
    if "пригород" in lowered:
        return "Semi-Urban"
    if "город" in lowered:
        return "Urban"
    return None


def parse_patient_form_text(raw_text: str) -> tuple[dict[str, Any], list[str]]:
    text = _normalize_text(raw_text)
    fields: dict[str, Any] = {}
    warnings: list[str] = []

    full_name = _find_full_name(text)
    if full_name:
        fields["full_name"] = full_name
    else:
        warnings.append("Не удалось распознать поле: ФИО пациента")

    optional_extractors = {
        "snils": (r"СНИЛС\s*:?\s*([^\n]+)", _normalize_snils),
        "address": (r"Адрес\s*:?\s*([^\n]+)", _clean_address),
        "phone": (r"Телефон\s*:?\s*([^\n]+)", _normalize_phone),
    }

    for field_name, (pattern, normalizer) in optional_extractors.items():
        value = _find_line_value(text, pattern)
        if value is None:
            continue

        try:
            normalized = normalizer(value)
        except (TypeError, ValueError):
            normalized = None

        if normalized:
            fields[field_name] = normalized

    extractors = {
        "age": (r"Возраст\s*:?\s*(\d{1,3})", normalize_int, "Возраст"),
        "gender": (r"(?:^|\n)\s*(?:\d+\.\s*)?Пол\s*:?\s*([А-Яа-яЁё]+)", _normalize_gender, "Пол"),
        "bmi": (
            r"(?:BMI|ВМ.?|Индекс\s+массы\s+тела)[^\d\n]*?(\d+(?:[,.]\d+)?)",
            normalize_decimal,
            "BMI",
        ),
        "stress_level": (
            r"Уровень\s+стресса[^\n:]*:?\s*(\d{1,2})",
            normalize_int,
            "Уровень стресса",
        ),
        "physical_activity_level": (
            r"Уровень\s+физической\s+активности\s*:?\s*[^А-Яа-яЁё\n]*([А-Яа-яЁё]+)",
            _normalize_activity,
            "Уровень физической активности",
        ),
        "city_type": (
            r"Тип\s+насел[её]нного\s+пункта\s*:?\s*([А-Яа-яЁё ]+)",
            _normalize_city_type,
            "Тип населённого пункта",
        ),
        "daily_steps": (r"Шагов\s+в\s+день\s*:?\s*(\d[\d ]*)", normalize_int, "Шагов в день"),
        "sleep_hours": (
            r"Час[ыь]\s+сн[ао][^\d\n]*?(\d+(?:[,.]\d+)?)",
            normalize_decimal,
            "Часы сна",
        ),
        "doctor_visits_per_year": (
            r"Визитов\s+к\s+врачу\s+в\s+год\s*:?\s*[^\d\n]*(\d+)",
            normalize_int,
            "Визитов к врачу в год",
        ),
        "hospital_admissions": (r"Госпитализаций\s*:?\s*[^\d\n]*(\d+)", normalize_int, "Госпитализаций"),
        "medication_count": (r"Количество\s+лекарств\s*:?\s*[^\d\n]*(\d+)", normalize_int, "Количество лекарств"),
        "previous_year_cost": (
            r"Расходы\s+за\s+прошлый\s+год[^\n:]*:?\s*(\d[\d ]*(?:[,.]\d+)?)",
            normalize_decimal,
            "Расходы за прошлый год",
        ),
    }

    for field_name, (pattern, normalizer, label) in extractors.items():
        value = _find_line_value(text, pattern)
        if value is None:
            warnings.append(f"Не удалось распознать поле: {label}")
            continue

        try:
            normalized = normalizer(value)
        except (TypeError, ValueError):
            normalized = None

        if normalized is None or normalized == "":
            warnings.append(f"Не удалось нормализовать поле: {label}")
            continue

        fields[field_name] = normalized

    return fields, warnings


def _range_warning(field_name: str, value: Any) -> str:
    label = FIELD_LABELS.get(field_name, field_name)
    return f"Значение поля вне допустимого диапазона: {label} ({value})"


def _invalid_warning(field_name: str, value: Any) -> str:
    label = FIELD_LABELS.get(field_name, field_name)
    return f"Некорректное значение поля: {label} ({value})"


def validate_patient_fields(fields: dict[str, Any]) -> tuple[dict[str, Any], list[str]]:
    validated: dict[str, Any] = {}
    warnings: list[str] = []

    if "full_name" in fields:
        full_name = str(fields["full_name"]).strip()
        if 2 <= len(full_name) <= 255:
            validated["full_name"] = full_name
        else:
            warnings.append(_range_warning("full_name", fields["full_name"]))

    for field_name in ("snils", "address", "phone"):
        if field_name not in fields:
            continue
        value = str(fields[field_name]).strip()
        if value:
            validated[field_name] = value

    for field_name, (min_value, max_value) in INT_FIELD_RANGES.items():
        if field_name not in fields:
            continue
        value = fields[field_name]
        if isinstance(value, bool) or not isinstance(value, int):
            warnings.append(_invalid_warning(field_name, value))
            continue
        if value < min_value or value > max_value:
            warnings.append(_range_warning(field_name, value))
            continue
        validated[field_name] = value

    for field_name, (min_value, max_value) in FLOAT_FIELD_RANGES.items():
        if field_name not in fields:
            continue
        value = fields[field_name]
        if isinstance(value, bool) or not isinstance(value, int | float):
            warnings.append(_invalid_warning(field_name, value))
            continue
        numeric_value = float(value)
        if numeric_value < min_value or (max_value is not None and numeric_value > max_value):
            warnings.append(_range_warning(field_name, value))
            continue
        validated[field_name] = numeric_value

    if "gender" in fields:
        value = fields["gender"]
        if value in (0, 1):
            validated["gender"] = value
        else:
            warnings.append(_invalid_warning("gender", value))

    if "physical_activity_level" in fields:
        value = fields["physical_activity_level"]
        if value in {"Low", "Medium", "High"}:
            validated["physical_activity_level"] = value
        else:
            warnings.append(_invalid_warning("physical_activity_level", value))

    if "city_type" in fields:
        value = fields["city_type"]
        if value in {"Urban", "Semi-Urban", "Rural"}:
            validated["city_type"] = value
        else:
            warnings.append(_invalid_warning("city_type", value))

    for field_name in BOOL_FIELDS:
        if field_name not in fields:
            continue
        value = fields[field_name]
        if isinstance(value, bool):
            validated[field_name] = value
        else:
            warnings.append(_invalid_warning(field_name, value))

    return validated, warnings


def _filter_resolved_parse_warnings(warnings: list[str], fields: dict[str, Any]) -> list[str]:
    recognized_labels = {
        FIELD_LABELS[field_name]
        for field_name in fields
        if field_name in FIELD_LABELS
    }
    unresolved_optional_labels = {
        FIELD_LABELS[field_name]
        for field_name in OPTIONAL_TEXT_FIELDS
        if field_name not in fields
    }
    filtered: list[str] = []
    for warning in warnings:
        if warning.startswith("Не удалось распознать поле: ") or warning.startswith("Не удалось нормализовать поле: "):
            label = warning.rsplit(": ", 1)[-1]
            if label in recognized_labels or label in unresolved_optional_labels:
                continue
        filtered.append(warning)
    return filtered


def _normalized_word(value: str) -> str:
    return re.sub(r"[^а-яё]", "", value.casefold())


def _ocr_words(data: dict[str, list[Any]]) -> list[OcrWord]:
    words: list[OcrWord] = []
    for index, text in enumerate(data.get("text", [])):
        normalized = _normalized_word(str(text))
        if not normalized:
            continue

        left = int(data["left"][index])
        top = int(data["top"][index])
        width = int(data["width"][index])
        height = int(data["height"][index])
        if width <= 0 or height <= 0:
            continue

        line_key = (
            int(data["block_num"][index]),
            int(data["par_num"][index]),
            int(data["line_num"][index]),
        )
        words.append(
            OcrWord(
                text=normalized,
                box=Box(left, top, left + width, top + height),
                line_key=line_key,
            )
        )
    return words


def _ocr_lines(words: list[OcrWord]) -> list[OcrLine]:
    grouped: dict[tuple[int, int, int], list[OcrWord]] = defaultdict(list)
    for word in words:
        grouped[word.line_key].append(word)

    lines: list[OcrLine] = []
    for line_words in grouped.values():
        line_words = sorted(line_words, key=lambda word: word.box.left)
        text = " ".join(word.text for word in line_words)
        left = min(word.box.left for word in line_words)
        top = min(word.box.top for word in line_words)
        right = max(word.box.right for word in line_words)
        bottom = max(word.box.bottom for word in line_words)
        lines.append(OcrLine(text=text, box=Box(left, top, right, bottom)))
    return lines


def _find_square_boxes(image: Any) -> list[Box]:
    grayscale = image.convert("L")
    width, height = grayscale.size
    pixels = grayscale.load()
    visited = bytearray(width * height)
    min_side = max(8, int(max(width, height) * 0.012))
    max_side = max(min_side + 1, int(max(width, height) * 0.08))
    candidates: list[Box] = []

    def is_dark(x: int, y: int) -> bool:
        return pixels[x, y] < 145

    for start_y in range(height):
        for start_x in range(width):
            offset = start_y * width + start_x
            if visited[offset] or not is_dark(start_x, start_y):
                visited[offset] = 1
                continue

            queue = deque([(start_x, start_y)])
            visited[offset] = 1
            left = right = start_x
            top = bottom = start_y
            dark_count = 0

            while queue:
                x, y = queue.popleft()
                dark_count += 1
                left = min(left, x)
                right = max(right, x)
                top = min(top, y)
                bottom = max(bottom, y)

                for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                    if nx < 0 or ny < 0 or nx >= width or ny >= height:
                        continue
                    neighbor_offset = ny * width + nx
                    if visited[neighbor_offset]:
                        continue
                    visited[neighbor_offset] = 1
                    if is_dark(nx, ny):
                        queue.append((nx, ny))

            box = Box(left, top, right + 1, bottom + 1)
            if not (min_side <= box.width <= max_side and min_side <= box.height <= max_side):
                continue

            aspect_ratio = box.width / box.height
            fill_ratio = dark_count / max(1, box.width * box.height)
            if 0.65 <= aspect_ratio <= 1.45 and 0.05 <= fill_ratio <= 0.65:
                candidates.append(box)

    return candidates


def _is_checkbox_checked(image: Any, box: Box) -> bool:
    crop = image.crop((box.left, box.top, box.right, box.bottom)).convert("L")
    width, height = crop.size
    left = max(1, int(width * 0.25))
    top = max(1, int(height * 0.25))
    right = min(width - 1, int(width * 0.75))
    bottom = min(height - 1, int(height * 0.75))
    interior = crop.crop((left, top, right, bottom))
    pixels = list(interior.getdata())
    if not pixels:
        return False
    dark_pixels = sum(1 for pixel in pixels if pixel < 120)
    return dark_pixels / len(pixels) > 0.025


def _answer_box_by_word(squares: list[Box], words: list[OcrWord], row_y: float, answer: str, image_width: int) -> Box | None:
    row_tolerance = max(16, image_width * 0.025)
    answer_words = [
        word
        for word in words
        if word.text == answer and abs(word.box.center_y - row_y) <= row_tolerance
    ]
    if not answer_words:
        return None

    matches: list[tuple[float, Box]] = []
    for word in answer_words:
        for square in squares:
            if square.center_x >= word.box.left:
                continue
            if abs(square.center_y - word.box.center_y) > row_tolerance:
                continue
            distance = word.box.left - square.center_x
            if distance <= image_width * 0.12:
                matches.append((distance, square))

    if not matches:
        return None

    return min(matches, key=lambda item: item[0])[1]


def _fallback_answer_boxes(squares: list[Box], row_y: float, image_width: int) -> tuple[Box | None, Box | None]:
    row_tolerance = max(16, image_width * 0.025)
    row_squares = [square for square in squares if abs(square.center_y - row_y) <= row_tolerance]
    row_squares = sorted(row_squares, key=lambda square: square.center_x)
    if len(row_squares) < 2:
        return None, None
    return row_squares[-2], row_squares[-1]


def detect_checkbox_fields(image: Any, ocr_data: dict[str, list[Any]]) -> tuple[dict[str, bool], list[str]]:
    words = _ocr_words(ocr_data)
    lines = _ocr_lines(words)
    squares = _find_square_boxes(image)
    fields: dict[str, bool] = {}
    warnings: list[str] = []

    for field_name, label_tokens in CHECKBOX_LABELS.items():
        row = next(
            (
                line
                for line in lines
                if all(token in line.text for token in label_tokens)
            ),
            None,
        )
        if row is None:
            warnings.append(f"Не удалось найти строку чекбокса: {field_name}")
            continue

        yes_box = _answer_box_by_word(squares, words, row.box.center_y, "да", image.width)
        no_box = _answer_box_by_word(squares, words, row.box.center_y, "нет", image.width)
        if yes_box is None or no_box is None:
            fallback_yes, fallback_no = _fallback_answer_boxes(squares, row.box.center_y, image.width)
            yes_box = yes_box or fallback_yes
            no_box = no_box or fallback_no

        if yes_box is None or no_box is None:
            warnings.append(f"Не удалось найти чекбоксы в строке: {field_name}")
            fields[field_name] = False
            continue

        yes_checked = _is_checkbox_checked(image, yes_box)
        no_checked = _is_checkbox_checked(image, no_box)

        if yes_checked and no_checked:
            warnings.append(f"В поле {field_name} отмечены оба варианта")
            fields[field_name] = False
            continue

        fields[field_name] = bool(yes_checked)

    return fields, warnings


def extract_patient_form(image_bytes: bytes) -> dict[str, Any]:
    try:
        from PIL import Image
        import pytesseract
    except ImportError as exc:
        raise RuntimeError("OCR dependencies are not installed") from exc

    try:
        image = Image.open(BytesIO(image_bytes)).convert("RGB")
    except Exception as exc:
        raise ValueError("Не удалось прочитать изображение анкеты") from exc

    try:
        raw_text = pytesseract.image_to_string(image, lang=OCR_LANGUAGE, config=OCR_CONFIG)
        ocr_data = pytesseract.image_to_data(
            image,
            lang=OCR_LANGUAGE,
            config=OCR_CONFIG,
            output_type=pytesseract.Output.DICT,
        )
    except pytesseract.pytesseract.TesseractNotFoundError as exc:
        raise RuntimeError("Tesseract OCR is not installed") from exc
    except pytesseract.TesseractError as exc:
        raise RuntimeError(f"Tesseract OCR failed: {exc}") from exc

    text_fields, text_warnings = parse_patient_form_text(raw_text)
    fallback_raw_text = ""
    if text_warnings:
        try:
            fallback_raw_text = pytesseract.image_to_string(image, lang=OCR_FALLBACK_LANGUAGE, config=OCR_CONFIG)
        except pytesseract.TesseractError:
            fallback_raw_text = ""

    if fallback_raw_text:
        fallback_fields, fallback_warnings = parse_patient_form_text(fallback_raw_text)
        text_fields = {**fallback_fields, **text_fields}
        text_warnings = [*text_warnings, *fallback_warnings]
        text_warnings = _filter_resolved_parse_warnings(text_warnings, text_fields)

    checkbox_fields, checkbox_warnings = detect_checkbox_fields(image, ocr_data)

    fields, validation_warnings = validate_patient_fields({**text_fields, **checkbox_fields})
    return {
        "fields": fields,
        "raw_text": raw_text,
        "warnings": [*text_warnings, *checkbox_warnings, *validation_warnings],
    }
