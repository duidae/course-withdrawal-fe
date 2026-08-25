import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export const DateTimeCell = ({ value }: { value?: string }) => {
  if (!value) return <Box component="span" />;

  const spaceIndex = value.indexOf(" ");
  return (
    <Typography
      component="span"
      sx={{ fontSize: 14, color: "#333", lineHeight: 1.43 }}
    >
      {spaceIndex === -1 ? (
        value
      ) : (
        <>
          {value.slice(0, spaceIndex)}
          <br />
          {value.slice(spaceIndex + 1)}
        </>
      )}
    </Typography>
  );
};
