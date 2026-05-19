import type {
  HTMLAttributes,
  ReactNode,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from "react";

type KitTableProps = TableHTMLAttributes<HTMLTableElement> & {
  children: ReactNode;
};

type KitTableSectionProps = HTMLAttributes<HTMLTableSectionElement> & {
  children: ReactNode;
};

type KitTableRowProps = HTMLAttributes<HTMLTableRowElement> & {
  children: ReactNode;
};

type KitTableHeaderCellProps = ThHTMLAttributes<HTMLTableCellElement> & {
  children?: ReactNode;
};

type KitTableCellProps = TdHTMLAttributes<HTMLTableCellElement> & {
  children?: ReactNode;
};

export function KitTable({ children, className = "", ...props }: KitTableProps) {
  return (
    <table className={className} {...props}>
      {children}
    </table>
  );
}

export function KitTableHead({
  children,
  className = "",
  ...props
}: KitTableSectionProps) {
  return (
    <thead className={className} {...props}>
      {children}
    </thead>
  );
}

export function KitTableBody({
  children,
  className = "",
  ...props
}: KitTableSectionProps) {
  return (
    <tbody className={className} {...props}>
      {children}
    </tbody>
  );
}

export function KitTableRow({
  children,
  className = "",
  ...props
}: KitTableRowProps) {
  return (
    <tr className={className} {...props}>
      {children}
    </tr>
  );
}

export function KitTableHeaderCell({
  children,
  className = "",
  ...props
}: KitTableHeaderCellProps) {
  return (
    <th className={className} {...props}>
      {children}
    </th>
  );
}

export function KitTableCell({
  children,
  className = "",
  ...props
}: KitTableCellProps) {
  return (
    <td className={className} {...props}>
      {children}
    </td>
  );
}
