// script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const adminPortalSection = document.getElementById('admin-portal');
    const adminWelcomeName = document.getElementById('admin-welcome-name');
    const totalWorkspacesSpan = document.getElementById('total-workspaces');
    const totalWorkspaceUsersSpan = document.getElementById('total-workspace-users');

    // Pages
    const pages = document.querySelectorAll('.page');
    const adminDashboardPage = document.getElementById('admin-dashboard-page');
    const workspacesListPage = document.getElementById('workspaces-list-page');
    const workspaceDetailsPage = document.getElementById('workspace-details-page');
    const addEditWorkspacePage = document.getElementById('add-edit-workspace-page');
    const workspaceUsersListPage = document.getElementById('workspace-users-list-page');
    const workspaceUserDetailsPage = document.getElementById('workspace-user-details-page');
    const addEditWorkspaceUserPage = document.getElementById('add-edit-workspace-user-page');

    // Workspaces List
    const workspacesTableBody = document.querySelector('#workspaces-table tbody');
    const prevWorkspacePageBtn = document.getElementById('prev-workspace-page-btn');
    const nextWorkspacePageBtn = document.getElementById('next-workspace-page-btn');
    const workspacePageInfo = document.getElementById('workspace-page-info');

    // Workspace Details
    const workspaceDetailsContent = document.getElementById('workspace-details-content');

    // Add/Edit Workspace Form
    const workspaceFormTitle = document.getElementById('workspace-form-title');
    const workspaceForm = document.getElementById('workspace-form');
    const workspaceNameInput = document.getElementById('workspace-name');
    const workspaceDescriptionInput = document.getElementById('workspace-description');

    // Workspace Users List
    const currentWorkspaceNameSpan = document.getElementById('current-workspace-name');
    const workspaceUsersTableBody = document.querySelector('#workspace-users-table tbody');
    const prevWorkspaceUserPageBtn = document.getElementById('prev-workspace-user-page-btn');
    const nextWorkspaceUserPageBtn = document.getElementById('next-workspace-user-page-btn');
    const workspaceUserPageInfo = document.getElementById('workspace-user-page-info');

    // Workspace User Details
    const workspaceUserDetailsContent = document.getElementById('workspace-user-details-content');

    // Add/Edit Workspace User Form
    const workspaceUserFormTitle = document.getElementById('workspace-user-form-title');
    const workspaceUserForm = document.getElementById('workspace-user-form');
    const workspaceUserNameInput = document.getElementById('workspace-user-name');
    const workspaceUserEmailInput = document.getElementById('workspace-user-email');
    const workspaceUserRoleInput = document.getElementById('workspace-user-role');

    // Delete Confirmation Modal
    const deleteConfirmationModal = document.getElementById('delete-confirmation-modal');
    const deleteConfirmationText = document.getElementById('delete-confirmation-text');

    // --- Global State ---
    let currentActivePage = null;
    let currentWorkspaceId = null;
    let currentWorkspaceUserId = null;
    let isEditingWorkspace = false;
    let isEditingWorkspaceUser = false;
    let entityToDelete = null; // 'workspace' or 'workspace-user'
    let idToDelete = null;

    // Pagination state
    const itemsPerPage = 5; // Number of items per page for tables
    let currentWorkspacePage = 1;
    let currentWorkspaceUserPage = 1;


    // --- Data Simulation (using localStorage) ---
    let workspaces = JSON.parse(localStorage.getItem('workspaces')) || [];
    let workspaceUsers = JSON.parse(localStorage.getItem('workspaceUsers')) || {}; // { workspaceId: [user1, user2], ... }

    function saveData() {
        localStorage.setItem('workspaces', JSON.stringify(workspaces));
        localStorage.setItem('workspaceUsers', JSON.stringify(workspaceUsers));
    }

    // --- Core Navigation Function ---
    window.navigateTo = (pageId, entityId = null) => {
        // Hide all pages
        pages.forEach(page => {
            page.classList.remove('active');
        });

        // Show the requested page
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            currentActivePage = pageId; // Update global state
        }

        // Handle specific page data loading
        switch (pageId) {
            case 'admin-dashboard-page':
                renderDashboard();
                break;
            case 'workspaces-list-page':
                currentWorkspacePage = 1; // Reset pagination
                renderWorkspacesTable();
                break;
            case 'workspace-details-page':
                currentWorkspaceId = entityId;
                renderWorkspaceDetails(entityId);
                break;
            case 'add-edit-workspace-page':
                isEditingWorkspace = entityId !== null;
                prepareWorkspaceForm(entityId);
                break;
            case 'workspace-users-list-page':
                currentWorkspaceId = entityId; // Make sure we know which workspace users we're listing
                currentWorkspaceUserPage = 1; // Reset pagination
                renderWorkspaceUsersTable(entityId);
                break;
            case 'workspace-user-details-page':
                currentWorkspaceUserId = entityId;
                renderWorkspaceUserDetails(currentWorkspaceId, entityId); // Pass both IDs
                break;
            case 'add-edit-workspace-user-page':
                isEditingWorkspaceUser = entityId !== null;
                prepareWorkspaceUserForm(currentWorkspaceId, entityId); // Pass workspaceId
                break;
        }
    };

    // --- Dashboard Rendering ---
    function renderDashboard() {
        const adminName = localStorage.getItem('adminName') || 'Admin'; // Simulate admin name
        adminWelcomeName.textContent = adminName;
        totalWorkspacesSpan.textContent = workspaces.length;

        let totalUsers = 0;
        for (const wsId in workspaceUsers) {
            totalUsers += workspaceUsers[wsId].length;
        }
        totalWorkspaceUsersSpan.textContent = totalUsers;
    }

    // --- Workspaces List Functions ---
    function renderWorkspacesTable() {
        workspacesTableBody.innerHTML = ''; // Clear existing rows

        const startIndex = (currentWorkspacePage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedWorkspaces = workspaces.slice(startIndex, endIndex);

        paginatedWorkspaces.forEach(workspace => {
            const row = workspacesTableBody.insertRow();
            row.innerHTML = `
                <td>${workspace.name}</td>
                <td>${workspace.description || 'N/A'}</td>
                <td>
                    <button onclick="navigateTo('workspace-details-page', '${workspace.id}')" class="btn btn-secondary">View</button>
                    <button onclick="navigateTo('add-edit-workspace-page', '${workspace.id}')" class="btn btn-primary">Edit</button>
                    <button onclick="showDeleteConfirmation('workspace', '${workspace.id}')" class="btn btn-danger">Delete</button>
                </td>
            `;
        });

        // Update pagination controls
        const totalPages = Math.ceil(workspaces.length / itemsPerPage);
        workspacePageInfo.textContent = `Page ${currentWorkspacePage} of ${totalPages || 1}`;
        prevWorkspacePageBtn.disabled = currentWorkspacePage === 1;
        nextWorkspacePageBtn.disabled = currentWorkspacePage === totalPages || workspaces.length === 0;
    }

    window.prevWorkspacePage = () => {
        if (currentWorkspacePage > 1) {
            currentWorkspacePage--;
            renderWorkspacesTable();
        }
    };

    window.nextWorkspacePage = () => {
        const totalPages = Math.ceil(workspaces.length / itemsPerPage);
        if (currentWorkspacePage < totalPages) {
            currentWorkspacePage++;
            renderWorkspacesTable();
        }
    };

    window.addWorkspace = () => {
        navigateTo('add-edit-workspace-page', null); // null indicates adding new
    };

    function prepareWorkspaceForm(workspaceId) {
        if (workspaceId) {
            workspaceFormTitle.textContent = 'Edit Workspace';
            const workspace = workspaces.find(ws => ws.id === workspaceId);
            if (workspace) {
                workspaceNameInput.value = workspace.name;
                workspaceDescriptionInput.value = workspace.description;
            }
        } else {
            workspaceFormTitle.textContent = 'Add New Workspace';
            workspaceForm.reset(); // Clear form for new entry
        }
    }

    workspaceForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = workspaceNameInput.value.trim();
        const description = workspaceDescriptionInput.value.trim();

        if (isEditingWorkspace) {
            // Update existing workspace
            const index = workspaces.findIndex(ws => ws.id === currentWorkspaceId);
            if (index !== -1) {
                workspaces[index].name = name;
                workspaces[index].description = description;
            }
            alert('Workspace updated successfully!');
        } else {
            // Add new workspace
            const newWorkspace = {
                id: crypto.randomUUID(), // Generate a unique ID
                name,
                description,
            };
            workspaces.push(newWorkspace);
            workspaceUsers[newWorkspace.id] = []; // Initialize empty user array for new workspace
            alert('Workspace added successfully!');
        }
        saveData();
        navigateTo('workspaces-list-page');
    });

    // --- Workspace Details Functions ---
    function renderWorkspaceDetails(workspaceId) {
        const workspace = workspaces.find(ws => ws.id === workspaceId);
        if (workspace) {
            workspaceDetailsContent.innerHTML = `
                <p><strong>Name:</strong> ${workspace.name}</p>
                <p><strong>Description:</strong> ${workspace.description || 'N/A'}</p>
                <p><strong>ID:</strong> ${workspace.id}</p>
            `;
            // Store currentWorkspaceId for use in manage users/edit/delete buttons
            currentWorkspaceId = workspaceId;
        } else {
            workspaceDetailsContent.innerHTML = '<p>Workspace not found.</p>';
        }
    }

    window.editWorkspace = () => {
        navigateTo('add-edit-workspace-page', currentWorkspaceId);
    };

    // --- Workspace Users List Functions ---
    function renderWorkspaceUsersTable(workspaceId) {
        workspaceUsersTableBody.innerHTML = '';
        const workspace = workspaces.find(ws => ws.id === workspaceId);
        if (workspace) {
            currentWorkspaceNameSpan.textContent = workspace.name;
        } else {
            currentWorkspaceNameSpan.textContent = 'Unknown Workspace';
            return;
        }

        const users = workspaceUsers[workspaceId] || [];

        const startIndex = (currentWorkspaceUserPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedUsers = users.slice(startIndex, endIndex);

        if (paginatedUsers.length === 0) {
            workspaceUsersTableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 20px;">No users found for this workspace.</td></tr>`;
        } else {
            paginatedUsers.forEach(user => {
                const row = workspaceUsersTableBody.insertRow();
                row.innerHTML = `
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${user.role}</td>
                    <td>
                        <button onclick="navigateTo('workspace-user-details-page', '${user.id}')" class="btn btn-secondary">View</button>
                        <button onclick="navigateTo('add-edit-workspace-user-page', '${user.id}')" class="btn btn-primary">Edit</button>
                        <button onclick="showDeleteConfirmation('workspace-user', '${user.id}')" class="btn btn-danger">Delete</button>
                    </td>
                `;
            });
        }

        // Update pagination controls
        const totalPages = Math.ceil(users.length / itemsPerPage);
        workspaceUserPageInfo.textContent = `Page ${currentWorkspaceUserPage} of ${totalPages || 1}`;
        prevWorkspaceUserPageBtn.disabled = currentWorkspaceUserPage === 1;
        nextWorkspaceUserPageBtn.disabled = currentWorkspaceUserPage === totalPages || users.length === 0;
    }

    window.prevWorkspaceUserPage = () => {
        if (currentWorkspaceUserPage > 1) {
            currentWorkspaceUserPage--;
            renderWorkspaceUsersTable(currentWorkspaceId);
        }
    };

    window.nextWorkspaceUserPage = () => {
        const users = workspaceUsers[currentWorkspaceId] || [];
        const totalPages = Math.ceil(users.length / itemsPerPage);
        if (currentWorkspaceUserPage < totalPages) {
            currentWorkspaceUserPage++;
            renderWorkspaceUsersTable(currentWorkspaceId);
        }
    };


    window.addWorkspaceUser = () => {
        navigateTo('add-edit-workspace-user-page', null); // null indicates adding new user
    };

    function prepareWorkspaceUserForm(workspaceId, userId) {
        if (userId) {
            workspaceUserFormTitle.textContent = 'Edit Workspace User';
            const users = workspaceUsers[workspaceId] || [];
            const user = users.find(u => u.id === userId);
            if (user) {
                workspaceUserNameInput.value = user.name;
                workspaceUserEmailInput.value = user.email;
                workspaceUserRoleInput.value = user.role;
            }
        } else {
            workspaceUserFormTitle.textContent = 'Add New Workspace User';
            workspaceUserForm.reset();
        }
    }

    workspaceUserForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = workspaceUserNameInput.value.trim();
        const email = workspaceUserEmailInput.value.trim();
        const role = workspaceUserRoleInput.value.trim();

        if (!workspaceUsers[currentWorkspaceId]) {
            workspaceUsers[currentWorkspaceId] = []; // Initialize if it doesn't exist
        }

        if (isEditingWorkspaceUser) {
            const users = workspaceUsers[currentWorkspaceId];
            const index = users.findIndex(u => u.id === currentWorkspaceUserId);
            if (index !== -1) {
                users[index].name = name;
                users[index].email = email;
                users[index].role = role;
            }
            alert('Workspace user updated successfully!');
        } else {
            const newUser = {
                id: crypto.randomUUID(),
                name,
                email,
                role,
            };
            workspaceUsers[currentWorkspaceId].push(newUser);
            alert('Workspace user added successfully!');
        }
        saveData();
        navigateTo('workspace-users-list-page', currentWorkspaceId);
    });

    // --- Workspace User Details Functions ---
    function renderWorkspaceUserDetails(workspaceId, userId) {
        const users = workspaceUsers[workspaceId] || [];
        const user = users.find(u => u.id === userId);
        if (user) {
            workspaceUserDetailsContent.innerHTML = `
                <p><strong>Name:</strong> ${user.name}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Role:</strong> ${user.role}</p>
                <p><strong>ID:</strong> ${user.id}</p>
            `;
            currentWorkspaceUserId = userId; // Store for edit/delete
        } else {
            workspaceUserDetailsContent.innerHTML = '<p>Workspace user not found.</p>';
        }
    }

    window.editWorkspaceUser = () => {
        navigateTo('add-edit-workspace-user-page', currentWorkspaceUserId);
    };

    // --- Delete Confirmation Modal Logic ---
    window.showDeleteConfirmation = (entityType, id) => {
        entityToDelete = entityType;
        idToDelete = id;
        if (entityType === 'workspace') {
            const ws = workspaces.find(w => w.id === id);
            deleteConfirmationText.innerHTML = `Are you sure you want to delete the workspace "<strong>${ws ? ws.name : 'this workspace'}</strong>"? This action cannot be undone and will delete all associated users.`;
        } else if (entityType === 'workspace-user') {
            const users = workspaceUsers[currentWorkspaceId] || [];
            const user = users.find(u => u.id === id);
            deleteConfirmationText.innerHTML = `Are you sure you want to delete the user "<strong>${user ? user.name : 'this user'}</strong>"? This action cannot be undone.`;
        }
        deleteConfirmationModal.classList.add('show');
    };

    window.hideDeleteConfirmation = () => {
        deleteConfirmationModal.classList.remove('show');
        entityToDelete = null;
        idToDelete = null;
    };

    window.confirmDeletion = () => {
        if (entityToDelete === 'workspace' && idToDelete) {
            deleteWorkspace(idToDelete);
        } else if (entityToDelete === 'workspace-user' && idToDelete) {
            deleteWorkspaceUser(currentWorkspaceId, idToDelete);
        }
        hideDeleteConfirmation();
    };

    function deleteWorkspace(id) {
        workspaces = workspaces.filter(ws => ws.id !== id);
        delete workspaceUsers[id]; // Also delete all users associated with this workspace
        saveData();
        alert('Workspace and its users deleted successfully!');
        navigateTo('workspaces-list-page');
    }

    function deleteWorkspaceUser(workspaceId, userId) {
        if (workspaceUsers[workspaceId]) {
            workspaceUsers[workspaceId] = workspaceUsers[workspaceId].filter(u => u.id !== userId);
            saveData();
            alert('Workspace user deleted successfully!');
            navigateTo('workspace-users-list-page', workspaceId);
        }
    }

    window.logout = () => {
        alert('Admin logged out!');
        // In a real application, you'd clear session/token here
        adminPortalSection.classList.add('hidden'); // Hide the entire admin portal
        // You might redirect to a login page here
    };

    // --- Initial Load ---
    // Simulate initial login to show the admin portal
    adminPortalSection.classList.remove('hidden');
    navigateTo('admin-dashboard-page'); // Start at the dashboard

    // Dummy data for initial run if localStorage is empty
    if (workspaces.length === 0) {
        const dummyWorkspace1Id = crypto.randomUUID();
        const dummyWorkspace2Id = crypto.randomUUID();
        workspaces.push({ id: dummyWorkspace1Id, name: 'Marketing Campaign 2024', description: 'Oversee all marketing efforts for the year.' });
        workspaces.push({ id: dummyWorkspace2Id, name: 'Product Development Alpha', description: 'Manage the development cycle of our new software product.' });

        workspaceUsers[dummyWorkspace1Id] = [
            { id: crypto.randomUUID(), name: 'Alice Smith', email: 'alice@example.com', role: 'Manager' },
            { id: crypto.randomUUID(), name: 'Bob Johnson', email: 'bob@example.com', role: 'Member' },
        ];
        workspaceUsers[dummyWorkspace2Id] = [
            { id: crypto.randomUUID(), name: 'Charlie Brown', email: 'charlie@example.com', role: 'Lead Developer' },
            { id: crypto.randomUUID(), name: 'Diana Prince', email: 'diana@example.com', role: 'QA Engineer' },
        ];
        localStorage.setItem('adminName', 'Super Admin'); // Set a default admin name
        saveData();
    }
});