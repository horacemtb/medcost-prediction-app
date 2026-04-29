import { useEffect, useState } from "react";
import { medcostApi } from "../../../shared/api/medcost-api";
import type { HistoryItem } from "../../../shared/types/medcost";

export function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadHistory() {
    setLoading(true);
    setError("");
    try {
      const data = await medcostApi.history(search.trim() || undefined);
      setHistory(data.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  async function removeItem(id: number) {
    await medcostApi.deleteHistory(id);
    await loadHistory();
  }

  useEffect(() => {
    void loadHistory();
  }, []);

  return (
    <section className="dashboard-main">
      {error && <div className="error">{error}</div>}
      <section className="tile form-tile">
        <div className="row">
          <input placeholder="Поиск по ФИО или идентификатору" value={search} onChange={(e) => setSearch(e.target.value)} />
          <button onClick={loadHistory} disabled={loading}>Искать</button>
        </div>
        <table>
          <thead><tr><th>Идентификатор</th><th>ФИО</th><th>Возраст</th><th>Прогноз</th><th>Дата</th><th></th></tr></thead>
          <tbody>
            {history.map((h) => (
              <tr key={h.id}>
                <td>{h.id}</td>
                <td>{h.full_name}</td>
                <td>{h.age}</td>
                <td>{h.predicted_cost.toFixed(2)} ₽</td>
                <td>{new Date(h.created_at).toLocaleString()}</td>
                <td><button className="danger" onClick={() => removeItem(h.id)}>Удалить</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </section>
  );
}
