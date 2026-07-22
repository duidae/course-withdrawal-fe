export function DateTimeCell({ value }: { value?: string }) {
  if (!value) return <span />;
  const sp = value.indexOf(" ");
  if (sp === -1)
    return (
      <span style={{ fontSize: 14, color: "#333", lineHeight: "1.43" }}>
        {value}
      </span>
    );
  return (
    <span style={{ fontSize: 14, color: "#333", lineHeight: "1.43" }}>
      {value.slice(0, sp)}
      <br />
      {value.slice(sp + 1)}
    </span>
  );
}
