# 📚 HH Attendance Tracker

A modern, full-stack web application for managing attendance in educational institutions and organizations. Built with React.js frontend and Node.js/Express backend with MongoDB database.

## 🌟 Features

### 🏢 Room Management
- **Create Rooms**: Set up classrooms, departments, or groups
- **Dynamic Field Configuration**: Customize member fields based on your CSV/Excel imports
- **Flexible Structure**: Adapt to different organizational needs

### 👥 Member Management
- **CSV/Excel Import**: Bulk import members from spreadsheet files
- **Dynamic Fields**: Support for any field structure (Name, Email, Phone, Student ID, Department, etc.)
- **Data Validation**: Automatic validation and error handling during import

### ✅ Attendance Tracking
- **Session Management**: Create and manage attendance sessions
- **Real-time Updates**: Mark attendance as Present, Absent, or Late
- **Visual Interface**: Clean, intuitive UI for quick attendance marking
- **Bulk Operations**: Efficient handling of large groups

### 📊 Reporting & Export
- **PDF Export**: Professional attendance reports with Excel-like tables
- **CSV Export**: Export data for further analysis
- **Dynamic Tables**: Automatically adapts to your field configuration
- **Professional Styling**: Clean, corporate-ready report format

### 🎨 User Experience
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional interface with Tailwind CSS
- **Real-time Feedback**: Instant visual feedback for all actions
- **Error Handling**: Comprehensive error messages and validation

## 🛠️ Technology Stack

### Frontend
- **React.js** - Modern JavaScript framework
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and development server
- **jsPDF** - PDF generation library
- **PapaParse** - CSV parsing library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Multer** - File upload middleware
- **XLSX** - Excel file processing

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/hisham1665/Attendence_tracker.git
   cd Attendence_tracker
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Configuration**
   
   Create a `.env` file in the backend directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/attendance-tracker
   PORT=5000
   NODE_ENV=development
   ```

5. **Start the Application**
   
   **Backend** (Terminal 1):
   ```bash
   cd backend
   npm start
   ```
   
   **Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📋 Usage Guide

### 1. Create a Room
- Navigate to the dashboard
- Click "Create New Room"
- Enter room details (name, description)
- Choose to import members or create manually

### 2. Import Members
- Upload a CSV or Excel file with member data
- The system automatically detects and configures fields
- Supported formats: `.csv`, `.xlsx`, `.xls`
- Sample CSV format:
  ```csv
  Name,Email,Phone,Department,Student ID
  John Doe,john@example.com,123-456-7890,Computer Science,CS001
  Jane Smith,jane@example.com,098-765-4321,Mathematics,MATH002
  ```

### 3. Track Attendance
- Select a room from the dashboard
- Create a new session or continue existing one
- Mark attendance for each member:
  - ✅ **Present** - Member is present
  - ❌ **Absent** - Member is absent
  - ⏰ **Late** - Member arrived late

### 4. Generate Reports
- Use the export dropdown in any session
- **PDF Export**: Professional report with all dynamic fields
- **CSV Export**: Raw data for spreadsheet analysis

## 📁 Project Structure

```
Attendence_tracker/
├── backend/
│   ├── controllers/         # Request handlers
│   ├── models/             # Database schemas
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── uploads/            # File upload directory
│   └── server.js           # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── utils/          # Utility functions
│   │   └── main.jsx        # App entry point
│   ├── public/             # Static assets
│   └── index.html          # HTML template
└── README.md
```

## 🎯 Key Features Deep Dive

### Dynamic Field Configuration
The system automatically adapts to your data structure:
- Imports CSV/Excel files with any column structure
- Creates dynamic field configuration based on file headers
- UI adapts to show your specific fields
- PDF reports include all your custom fields

### Professional PDF Reports
- Excel-like table formatting
- Automatic column width distribution
- Status color coding (Green=Present, Red=Absent, Orange=Late)
- Professional header with room and session information
- Handles multi-page reports seamlessly

### Flexible Data Import
- Supports both CSV and Excel formats
- Automatic field detection and mapping
- Error handling for malformed data
- Preview before final import

## 🐛 Troubleshooting

### Common Issues

**1. MongoDB Connection Failed**
- Ensure MongoDB is running
- Check connection string in `.env` file
- Verify network connectivity

**2. File Upload Issues**
- Check file format (CSV, XLSX, XLS only)
- Ensure file size is under 10MB
- Verify file is not corrupted

**3. PDF Export Problems**
- Ensure jsPDF dependencies are installed
- Check browser console for errors
- Try refreshing the page

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Hisham**
- GitHub: [@hisham1665](https://github.com/hisham1665)

## 🙏 Acknowledgments

- React.js community for excellent documentation
- MongoDB team for the robust database solution
- Contributors and testers who helped improve the application
---

### 🚀 Ready to track attendance like a pro? Get started now!

For questions, issues, or feature requests, please open an issue on GitHub.
