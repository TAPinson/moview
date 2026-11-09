import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

type UnavailableMovieCardProps = {
  movieId: number;
  isRetrying: boolean;
  onRetry: () => void;
};

export function UnavailableMovieCard({
  movieId,
  isRetrying,
  onRetry,
}: UnavailableMovieCardProps) {
  return (
    <Card className="movie-result-card" variant="outlined">
      <CardContent>
        <Typography className="movie-result-title" component="h2" variant="h6">
          Movie details unavailable
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Movie ID: {movieId}. This movie is still in your list.
        </Typography>
        <Button
          type="button"
          disabled={isRetrying}
          onClick={onRetry}
          aria-label={`Retry loading movie ${movieId}`}
        >
          {isRetrying ? "Retrying…" : "Retry"}
        </Button>
      </CardContent>
    </Card>
  );
}
