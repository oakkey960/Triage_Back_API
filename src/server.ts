import app from './app';

const PORT = process.env.PORT || 5001;

app.listen(PORT as number, '0.0.0.0', () => {
  console.log(`Triage API Server is running on http://0.0.0.0:${PORT}`);
});