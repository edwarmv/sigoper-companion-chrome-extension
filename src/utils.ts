export const formatDate = (value: Date | string | undefined) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : new Intl.DateTimeFormat("es-BO", { dateStyle: "medium" }).format(date);
};

export const formatDateTime = (value: Date | undefined) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-BO", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(value);
};
