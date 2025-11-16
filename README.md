# Chess Application

A fully functional web-based chess application with drag-and-drop functionality, move validation, and game tracking.

## Features

### Core Functionality
- **Full Chess Rules**: Complete implementation of chess rules including legal moves, check, checkmate, stalemate, and draw detection
- **Drag-and-Drop**: Intuitive piece movement via drag-and-drop or click-to-move
- **Legal Move Highlighting**: Visual indicators for legal moves and capture opportunities
- **Move History**: Complete move notation display with algebraic notation
- **Captured Pieces Display**: Shows captured pieces for both players
- **Game Timer**: 10-minute timer for each player with automatic switching

### User Interface
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Board Flipping**: Option to flip the board perspective
- **Undo Functionality**: Take back moves with Ctrl+Z or button click
- **Visual Feedback**: Hover effects, selection highlighting, and smooth animations
- **Game Status Display**: Real-time game status including check warnings

### Additional Features
- **Keyboard Shortcuts**: 
  - `Ctrl+Z`: Undo move
  - `F`: Flip board
  - `N`: New game
- **Notifications**: Non-intrusive notifications for game events
- **Coordinate Display**: Standard chess board coordinates (a-h, 1-8)

## Technologies Used

### Frontend
- **HTML5**: Semantic markup structure
- **CSS3**: Modern styling with flexbox/grid, transitions, and animations
- **JavaScript (ES6+)**: Game logic and interactivity
- **Font Awesome**: Icons for UI elements

### Libraries
- **Chess.js**: Chess game engine for move validation and game state management
- **Unicode Chess Pieces**: Native chess piece symbols

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No additional dependencies required

### Installation
1. Clone or download the project files
2. Open `index.html` in your web browser
3. Start playing chess!

### File Structure
```
chess-application/
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── script.js           # JavaScript game logic
└── README.md           # Project documentation
```

## How to Play

### Basic Controls
1. **Moving Pieces**: 
   - Click a piece to select it, then click a highlighted square to move
   - Or drag pieces directly to their destination
2. **Game Controls**:
   - **New Game**: Start a fresh game
   - **Undo**: Take back the last move
   - **Flip Board**: Change board perspective

### Game Rules
- White moves first
- Pieces must follow standard chess movement rules
- Game ends in checkmate, stalemate, draw, or timeout
- Timer switches automatically after each move

## Game States

### Check
- When a king is under attack, "Check!" is displayed
- Player must move to resolve the check

### Checkmate
- Game ends when a king is in check and cannot escape
- Winner is announced

### Stalemate
- Game ends in draw when a player has no legal moves but king is not in check

### Draw
- Game can end in draw by:
  - Stalemate
  - Threefold repetition
  - Fifty-move rule (not yet implemented)
  - Insufficient material

## Browser Compatibility

This application works on all modern browsers:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Mobile Support

The application is fully responsive and works on:
- iOS Safari 12+
- Chrome Mobile 60+
- Samsung Internet 8+

## Future Enhancements

### Planned Features
- **AI Opponent**: Computer opponent with difficulty levels
- **Multiplayer**: Real-time online play via WebSockets
- **Game Analysis**: Move evaluation and suggestions
- **Save/Load Games**: Persistent game storage
- **Tournament Mode**: Swiss or round-robin tournaments
- **Themes**: Customizable board and piece themes
- **Sound Effects**: Audio feedback for moves and captures

### Technical Improvements
- **Progressive Web App**: Offline support and app-like experience
- **Accessibility**: Screen reader support and keyboard navigation
- **Performance**: Optimized rendering for older devices
- **Internationalization**: Multi-language support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Chess.js library for game logic
- Font Awesome for icons
- Unicode chess symbols for piece representation

## Contact

For questions, suggestions, or bug reports, please open an issue on the project repository.
