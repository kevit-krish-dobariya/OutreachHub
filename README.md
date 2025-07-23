# 📬 OutreachHub

**OutreachHub** is a modern multi-tenant contact and campaign management platform built with HTML, CSS, and JavaScript. It supports workspace-based user roles (Admin, Editor, Viewer) and enables contact management, message template creation, and targeted outreach campaigns with detailed analytics.

---

## 🚀 Features

### 🔒 Authentication & Authorization
- Role-based login (Admin / User)
- JWT token-based secure session handling
- Page-level access control (Editor, Viewer)

### 👥 Contacts Management
- Add, view, edit, and delete contacts
- Tagging support (comma-separated tags)
- Contact notes
- Pagination & search
- Data persistence via protected API

### 📝 Message Templates
- Text or Text + Image templates
- Edit, delete, and preview templates
- Auto-populated template dropdown in campaigns

### 📢 Campaign Management
- Create outreach campaigns using selected contacts and templates
- Support for targeting via tags
- View campaign summary and details

### 📊 Analytics (Planned)
- Track number of contacts reached
- Template usage statistics
- Success/failure metrics (future feature)

---

## 🏗️ Tech Stack

| Layer       | Technology                  |
|------------|-----------------------------|
| Frontend   | HTML, CSS (Custom theme), JavaScript |
| Auth       | JWT token-based via localStorage     |
| Backend    | Node.js, Express, NestJS (for APIs) |
| Database   | MongoDB Atlas (for users, contacts, templates) |

---

## 📁 Folder Structure

```bash
OutreachHub/
├── index.html               # Landing page / login
├── home.html                # User dashboard
├── contacts.html            # Contacts module
├── templates.html           # Templates module
├── campaigns.html           # Campaigns module
├── css/
│   └── styles.css           # Custom CSS with Poppins theme
├── js/
│   ├── auth.js              # JWT token handling
│   ├── contacts.js          # Contact CRUD & view
│   ├── templates.js         # Template handling
│   ├── campaigns.js         # Campaign logic
│   └── utils.js             # Common functions
├── assets/
│   └── images/              # Template images
└── README.md
