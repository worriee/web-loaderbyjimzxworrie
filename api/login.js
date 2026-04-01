
const hardcodedSecret = "4MU6BNJASUMBFY6SIDLZ";

export default (req, res) => {
  const { password } = req.body;

  if (password === process.env.VITE_ADMIN_PASSWORD) {
    res.status(200).json({ success: true, secret: hardcodedSecret });
  } else {
    res.status(401).json({ success: false, message: "Invalid password" });
  }
};
