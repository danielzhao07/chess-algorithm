# ♟️ Chess Game

A modern, interactive chess game built with vanilla HTML, CSS, and JavaScript. Play chess in your browser with a clean, responsive interface and prepare for AI opponent integration.

## 🎮 Features

- **Interactive Chessboard** - Click and drag pieces with visual feedback
- **Valid Move Highlighting** - See all legal moves for selected pieces
- **Full Chess Rules** - Implements movement rules for all pieces (pawns, rooks, knights, bishops, queens, kings)
- **Move History** - Track all moves in algebraic notation
- **Captured Pieces Display** - View captured pieces for both players
- **Undo Functionality** - Revert your last move
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Dark Mode Support** - Automatic theme switching based on system preferences
- **AI Integration Ready** - Dedicated section prepared for chess engine implementation

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (optional, but recommended for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/chess-game.git
   cd chess-game
   ```

2. **Open the game**
   - Simply open `index.html` in your browser, or
   - Use a local server (recommended):
     ```bash
     # Using Python 3
     python -m http.server 8000
     
     # Using Node.js http-server
     npx http-server
     ```

3. **Start playing!**
   - Navigate to `http://localhost:8000` in your browser

## 📁 Project Structure

```
chess-game/
├── index.html      # Main HTML structure
├── styles.css      # All styling and design system
├── main.js         # Game logic and interactions
└── README.md       # Project documentation
```

## 🎯 How to Play

1. **Starting the Game** - White moves first
2. **Making Moves** - Click a piece to see valid moves, then click a destination square
3. **Capturing** - Move to an opponent's square to capture their piece
4. **Undo** - Click "Undo Move" to revert your last move
5. **New Game** - Click "New Game" to reset the board

## 🎨 Design System

The game uses a custom design system with:
- CSS custom properties for easy theming
- Light and dark mode support
- Responsive breakpoints for mobile devices
- Consistent spacing, typography, and color palette

## 🤖 AI Integration (Coming Soon)

The game includes a dedicated AI section ready for integration. To add a chess engine:

1. Choose your chess engine (Stockfish, chess.js, custom algorithm)
2. Implement the AI logic in the designated section in `main.js`
3. Connect the AI to make moves after the player's turn
4. Update the AI placeholder in the UI

Example integration points are marked with comments in the code.

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Vercel will auto-detect the static site
4. Deploy - your site will be live instantly!

### Deploy to GitHub Pages

1. Go to your repository Settings → Pages
2. Select your branch (usually `main`) and root folder
3. Save - your site will be live at `username.github.io/chess-game`

## 🛠️ Technologies Used

- **Vercel** - Scalable Project Deployment
- **HTML5** - Semantic structure
- **CSS3** - Modern styling with custom properties and grid layout
- **JavaScript (ES6+)** - Game logic and interactivity
- **No dependencies** - Pure vanilla JavaScript

## 📝 Future Enhancements

- [ ] AI opponent integration
- [ ] Checkmate and stalemate detection
- [ ] En passant capture
- [ ] Castling support
- [ ] Pawn promotion
- [ ] Game save/load functionality
- [ ] Multiplayer support
- [ ] Timer/clock functionality
- [ ] Move validation improvements

## 🤝 Contributing

Contributions are welcome! Feel free to:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

Your Name - [@JummyJoeJackson](https://github.com/JummyJoeJackson)

## 🙏 Acknowledgments

- Chess piece Unicode symbols
- Modern design inspiration from Chess.com and Lichess.org
- Community feedback and contributions

---

**Enjoy playing chess!** ♟️
