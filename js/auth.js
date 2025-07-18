
// workspaces.js

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const workspacesTableBody = document.getElementById('workspacesTableBody');
    const createWorkspaceButton = document.getElementById('createWorkspaceButton');

    // Workspace Modal Elements
    const workspaceModal = document.getElementById('workspaceModal');
    const workspaceModalTitle = document.getElementById('workspaceModalTitle');
    const workspaceForm = document.getElementById('workspaceForm');
    const workspaceIdInput = document.getElementById('workspaceIdInput');
    const workspaceNameInput = document.getElementById('workspaceNameInput');
    const workspaceDescriptionInput = document.getElementById('workspaceDescriptionInput');
    const cancelWorkspaceModalButton = document.getElementById('cancelWorkspaceModal');

    // Workspace Users Modal Elements
    const workspaceUsersModal = document.getElementById('workspaceUsersModal');
    const workspaceUsersModalTitle = document.getElementById('workspaceUsersModalTitle');
    const currentWorkspaceNameSpan = document.getElementById('currentWorkspaceName');
    const currentWorkspaceIdInput = document.getElementById('currentWorkspaceId');
    const workspaceUsersTableBody = document.getElementById('workspaceUsersTableBody');
    const createWorkspaceUserButton = document.getElementById('createWorkspaceUserButton');
    const closeWorkspaceUsersModalButton = document.getElementById('closeWorkspaceUsersModal');

    // Workspace User Create/Edit Modal Elements
    const workspaceUserModal = document.getElementById('workspaceUserModal');
    const workspaceUserModalTitle = document.getElementById('workspaceUserModalTitle');
    const workspaceUserForm = document.getElementById('workspaceUserForm');
    const workspaceUserIdInput = document.getElementById('workspaceUserIdInput');
    const workspaceUserNameInput = document.getElementById('workspaceUserNameInput');
    const workspaceUserRoleInput = document.getElementById('workspaceUserRoleInput');
    const cancelWorkspaceUserModalButton = document.getElementById('cancelWorkspaceUserModal');

    // Confirmation Modal Elements
    const confirmationModal = document.getElementById('confirmationModal');
    const confirmationMessage = document.getElementById('confirmationMessage');
    const confirmActionButton = document.getElementById('confirmActionButton');
    const cancelConfirmationButton = document.getElementById('cancelConfirmationButton');

    // --- Data Storage (Simulated Backend with localStorage) ---
    // This is for demonstration only. In a real application, this data would come from a database via an API.
    let workspacesData = JSON.parse(localStorage.getItem('outreachUbWorkspaces')) || [];

    // Helper to save data to localStorage
    function saveWorkspacesData() {
        localStorage.setItem('outreachUbWorkspaces', JSON.stringify(workspacesData));
    }

    // --- Modals Management ---
    function openModal(modalElement) {
        modalElement.classList.add('is-visible');
    }

    function closeModal(modalElement) {
        modalElement.classList.remove('is-visible');
    }

    // --- Confirmation Modal Logic ---
    let pendingAction = null; // Stores the function to execute on confirmation

    function showConfirmation(message, actionCallback) {
        confirmationMessage.textContent = message;
        pendingAction = actionCallback;
        openModal(confirmationModal);
    }

    confirmActionButton.addEventListener('click', () => {
        if (pendingAction) {
            pendingAction();
            pendingAction = null; // Clear the pending action
        }
        closeModal(confirmationModal);
    });

    cancelConfirmationButton.addEventListener('click', () => {
        closeModal(confirmationModal);
        pendingAction = null; // Clear the pending action
    });


    // --- Workspaces Module Functions ---

    // Renders the list of workspaces in the table
    function renderWorkspaces() {
        workspacesTableBody.innerHTML = ''; // Clear existing rows

        if (workspacesData.length === 0) {
            workspacesTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px;">No workspaces found. Create one to get started!</td></tr>';
            return;
        }

        workspacesData.forEach(workspace => {
            const row = workspacesTableBody.insertRow();
            row.innerHTML = `
                <td>${workspace.name}</td>
                <td>${workspace.description || 'N/A'}</td>
                <td>${workspace.users ? workspace.users.length : 0}</td>
                <td class="action-buttons-group">
                    <button class="action-button-icon view-icon" data-id="${workspace.id}" data-action="view-users" title="Manage Users">
                        <i class="fas fa-users"></i>
                    </button>
                    <button class="action-button-icon edit-icon" data-id="${workspace.id}" data-action="edit-workspace" title="Edit Workspace">
                        <i class="fas fa-pencil-alt"></i>
                    </button>
                    <button class="action-button-icon delete-icon" data-id="${workspace.id}" data-action="delete-workspace" title="Delete Workspace">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
        });

        // Attach event listeners to action buttons
        workspacesTableBody.querySelectorAll('.action-button-icon').forEach(button => {
            button.addEventListener('click', handleWorkspaceAction);
        });
    }

    // Handles click events for workspace action buttons
    function handleWorkspaceAction(event) {
        const button = event.currentTarget;
        const workspaceId = button.dataset.id;
        const action = button.dataset.action;

        switch (action) {
            case 'view-users':
                viewWorkspaceUsers(workspaceId);
                break;
            case 'edit-workspace':
                editWorkspace(workspaceId);
                break;
            case 'delete-workspace':
                showConfirmation('Are you sure you want to delete this workspace? This action cannot be undone.', () => deleteWorkspace(workspaceId));
                break;
        }
    }

    // Opens the create/edit workspace modal
    if (createWorkspaceButton) { // Check if element exists (only on workspaces.html)
        createWorkspaceButton.addEventListener('click', () => {
            workspaceModalTitle.textContent = 'Create New Workspace';
            workspaceForm.reset(); // Clear form fields
            workspaceIdInput.value = ''; // Ensure no ID is set for new creation
            openModal(workspaceModal);
        });
    }


    // Submits the workspace form (create or update)
    if (workspaceForm) {
        workspaceForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const id = workspaceIdInput.value;
            const name = workspaceNameInput.value.trim();
            const description = workspaceDescriptionInput.value.trim();

            if (!name) {
                // Using alert here for simplicity, ideally a custom message box
                showConfirmation('Workspace name is required.', () => {}); // Acknowledge message
                return;
            }

            if (id) {
                // Update existing workspace
                const index = workspacesData.findIndex(ws => ws.id === id);
                if (index !== -1) {
                    workspacesData[index].name = name;
                    workspacesData[index].description = description;
                }
            } else {
                // Create new workspace
                const newWorkspace = {
                    id: crypto.randomUUID(), // Generate a unique ID
                    name: name,
                    description: description,
                    users: [] // Initialize with an empty array for users
                };
                workspacesData.push(newWorkspace);
            }

            saveWorkspacesData();
            renderWorkspaces();
            closeModal(workspaceModal);
        });
    }


    // Populates the form for editing a workspace
    function editWorkspace(id) {
        const workspace = workspacesData.find(ws => ws.id === id);
        if (workspace) {
            workspaceModalTitle.textContent = 'Edit Workspace';
            workspaceIdInput.value = workspace.id;
            workspaceNameInput.value = workspace.name;
            workspaceDescriptionInput.value = workspace.description;
            openModal(workspaceModal);
        }
    }

    // Deletes a workspace
    function deleteWorkspace(id) {
        workspacesData = workspacesData.filter(ws => ws.id !== id);
        saveWorkspacesData();
        renderWorkspaces();
    }

    // Closes the workspace create/edit modal
    if (cancelWorkspaceModalButton) {
        cancelWorkspaceModalButton.addEventListener('click', () => {
            closeModal(workspaceModal);
        });
    }


    // --- Workspace Users Sub-Module Functions ---

    // Displays the users for a specific workspace in a modal
    function viewWorkspaceUsers(workspaceId) {
        const workspace = workspacesData.find(ws => ws.id === workspaceId);
        if (workspace) {
            currentWorkspaceIdInput.value = workspace.id;
            currentWorkspaceNameSpan.textContent = workspace.name;
            renderWorkspaceUsers(workspace.id);
            openModal(workspaceUsersModal);
        }
    }

    // Renders the list of users for the current workspace
    function renderWorkspaceUsers(workspaceId) {
        const workspace = workspacesData.find(ws => ws.id === workspaceId);
        const usersTableBody = workspaceUsersTableBody;
        usersTableBody.innerHTML = ''; // Clear existing rows

        if (!workspace || !workspace.users || workspace.users.length === 0) {
            usersTableBody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 20px;">No users found for this workspace.</td></tr>';
            return;
        }

        workspace.users.forEach(user => {
            const row = usersTableBody.insertRow();
            row.innerHTML = `
                <td>${user.name}</td>
                <td>${user.role}</td>
                <td class="action-buttons-group">
                    <button class="action-button-icon edit-icon" data-user-id="${user.id}" data-workspace-id="${workspace.id}" data-action="edit-user" title="Edit User">
                        <i class="fas fa-user-edit"></i>
                    </button>
                    <button class="action-button-icon delete-icon" data-user-id="${user.id}" data-workspace-id="${workspace.id}" data-action="delete-user" title="Delete User">
                        <i class="fas fa-user-minus"></i>
                    </button>
                </td>
            `;
        });

        // Attach event listeners to user action buttons
        usersTableBody.querySelectorAll('.action-button-icon').forEach(button => {
            button.addEventListener('click', handleWorkspaceUserAction);
        });
    }

    // Handles click events for workspace user action buttons
    function handleWorkspaceUserAction(event) {
        const button = event.currentTarget;
        const userId = button.dataset.userId;
        const workspaceId = button.dataset.workspaceId; // Get workspace ID from button
        const action = button.dataset.action;

        switch (action) {
            case 'edit-user':
                editWorkspaceUser(workspaceId, userId);
                break;
            case 'delete-user':
                showConfirmation('Are you sure you want to remove this user from the workspace?', () => deleteWorkspaceUser(workspaceId, userId));
                break;
        }
    }

    // Opens the create/edit workspace user modal
    if (createWorkspaceUserButton) {
        createWorkspaceUserButton.addEventListener('click', () => {
            workspaceUserModalTitle.textContent = 'Add New Workspace User';
            workspaceUserForm.reset();
            workspaceUserIdInput.value = ''; // No user ID for new creation
            openModal(workspaceUserModal);
        });
    }


    // Submits the workspace user form (create or update)
    if (workspaceUserForm) {
        workspaceUserForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const workspaceId = currentWorkspaceIdInput.value; // Get the ID of the workspace currently being viewed
            const userId = workspaceUserIdInput.value;
            const userName = workspaceUserNameInput.value.trim();
            const userRole = workspaceUserRoleInput.value;

            if (!userName) {
                showConfirmation('User name is required.', () => {}); // Acknowledge message
                return;
            }

            const workspace = workspacesData.find(ws => ws.id === workspaceId);
            if (!workspace) {
                console.error('Workspace not found for user operation.');
                closeModal(workspaceUserModal);
                return;
            }

            if (userId) {
                // Update existing user
                const userIndex = workspace.users.findIndex(u => u.id === userId);
                if (userIndex !== -1) {
                    workspace.users[userIndex].name = userName;
                    workspace.users[userIndex].role = userRole;
                }
            } else {
                // Create new user
                const newUser = {
                    id: crypto.randomUUID(), // Generate a unique ID for the user
                    name: userName,
                    role: userRole
                };
                workspace.users.push(newUser);
            }

            saveWorkspacesData();
            renderWorkspaceUsers(workspaceId); // Re-render users for the current workspace
            closeModal(workspaceUserModal);
        });
    }


    // Populates the form for editing a workspace user
    function editWorkspaceUser(workspaceId, userId) {
        const workspace = workspacesData.find(ws => ws.id === workspaceId);
        if (!workspace) return;

        const user = workspace.users.find(u => u.id === userId);
        if (user) {
            workspaceUserModalTitle.textContent = 'Edit Workspace User';
            workspaceUserIdInput.value = user.id;
            workspaceUserNameInput.value = user.name;
            workspaceUserRoleInput.value = user.role;
            openModal(workspaceUserModal);
        }
    }

    // Deletes a workspace user
    function deleteWorkspaceUser(workspaceId, userId) {
        const workspace = workspacesData.find(ws => ws.id === workspaceId);
        if (workspace) {
            workspace.users = workspace.users.filter(u => u.id !== userId);
            saveWorkspacesData();
            renderWorkspaceUsers(workspaceId); // Re-render users for the current workspace
        }
    }

    // Closes the workspace users modal
    if (closeWorkspaceUsersModalButton) {
        closeWorkspaceUsersModalButton.addEventListener('click', () => {
            closeModal(workspaceUsersModal);
        });
    }


    // Closes the workspace user create/edit modal
    if (cancelWorkspaceUserModalButton) {
        cancelWorkspaceUserModalButton.addEventListener('click', () => {
            closeModal(workspaceUserModal);
        });
    }


    // --- Initial Render on Load ---
    // Only render workspaces if on the workspaces.html page
    if (workspacesTableBody) {
        renderWorkspaces();
    }
});
