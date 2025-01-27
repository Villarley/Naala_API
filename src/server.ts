import app from './app';

const PORT = process.env.PORT || 5000;
// it works
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
