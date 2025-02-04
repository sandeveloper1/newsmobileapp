// Custom Newspaper Management
const CustomNewspaperManager = {
    KEY: 'newsflow_custom_newspapers',

    // Get all custom newspapers
    getCustomNewspapers() {
        const newspapers = localStorage.getItem(this.KEY);
        return newspapers ? JSON.parse(newspapers) : [];
    },

    // Add a new custom newspaper
    addCustomNewspaper(newspaper) {
        const newspapers = this.getCustomNewspapers();
        
        // Generate a unique ID
        newspaper.id = `custom_${Date.now()}`;
        
        // Validate required fields
        if (!newspaper.title || !newspaper.link) {
            throw new Error('Title and link are required');
        }

        // Set default values if not provided
        newspaper.category = newspaper.category || 'Custom';
        newspaper.language = newspaper.language || 'english';

        newspapers.push(newspaper);
        localStorage.setItem(this.KEY, JSON.stringify(newspapers));
        return newspaper.id;
    },

    // Remove a custom newspaper
    removeCustomNewspaper(newspaperId) {
        let newspapers = this.getCustomNewspapers();
        newspapers = newspapers.filter(np => np.id !== newspaperId);
        localStorage.setItem(this.KEY, JSON.stringify(newspapers));
    },

    // Update an existing custom newspaper
    updateCustomNewspaper(newspaperId, updatedData) {
        let newspapers = this.getCustomNewspapers();
        const index = newspapers.findIndex(np => np.id === newspaperId);
        
        if (index !== -1) {
            newspapers[index] = { ...newspapers[index], ...updatedData };
            localStorage.setItem(this.KEY, JSON.stringify(newspapers));
        }
    }
};

// DOM Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const addNewspaperBtn = document.getElementById('addNewspaperBtn');
    const manageNewspapersBtn = document.getElementById('manageNewspapersBtn');
    const customNewspaperModal = new bootstrap.Modal(document.getElementById('customNewspaperModal'));

    // Add Newspaper Button
    if (addNewspaperBtn) {
        addNewspaperBtn.addEventListener('click', () => {
            customNewspaperModal.show();
        });
    }

    // Save Custom Newspaper Form
    const customNewspaperForm = document.getElementById('customNewspaperForm');
    if (customNewspaperForm) {
        customNewspaperForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const title = document.getElementById('customNewspaperTitle').value;
            const link = document.getElementById('customNewspaperLink').value;
            const category = document.getElementById('customNewspaperCategory').value;
            const language = document.getElementById('customNewspaperLanguage').value;

            try {
                CustomNewspaperManager.addCustomNewspaper({
                    title,
                    link,
                    category,
                    language
                });

                // Close modal
                customNewspaperModal.hide();

                // Show success toast
                const toast = new bootstrap.Toast(document.getElementById('successToast'));
                toast.show();

                // Reset form
                customNewspaperForm.reset();
            } catch (error) {
                // Show error toast
                const errorToast = new bootstrap.Toast(document.getElementById('errorToast'));
                document.getElementById('errorToastMessage').textContent = error.message;
                errorToast.show();
            }
        });
    }

    // Manage Newspapers Button
    if (manageNewspapersBtn) {
        manageNewspapersBtn.addEventListener('click', () => {
            renderCustomNewspapersList();
        });
    }
});

// Render Custom Newspapers List
function renderCustomNewspapersList() {
    const customNewspapersList = document.getElementById('customNewspapersList');
    if (customNewspapersList) {
        const newspapers = CustomNewspaperManager.getCustomNewspapers();
        
        // Clear existing list
        customNewspapersList.innerHTML = '';

        if (newspapers.length === 0) {
            customNewspapersList.innerHTML = `
                <div class="text-center text-muted py-3">
                    <i class="bi bi-newspaper fs-3 mb-2 d-block"></i>
                    No custom newspapers added yet
                </div>
            `;
            return;
        }

        newspapers.forEach(newspaper => {
            const listItem = document.createElement('div');
            listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
            listItem.innerHTML = `
                <div>
                    <h6 class="mb-1">${newspaper.title}</h6>
                    <small class="text-muted">${newspaper.link}</small>
                </div>
                <div>
                    <button class="btn btn-sm btn-outline-danger me-2" onclick="deleteCustomNewspaper('${newspaper.id}')">
                        <i class="bi bi-trash"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-primary" onclick="editCustomNewspaper('${newspaper.id}')">
                        <i class="bi bi-pencil"></i>
                    </button>
                </div>
            `;
            customNewspapersList.appendChild(listItem);
        });
    }
}

// Delete Custom Newspaper
window.deleteCustomNewspaper = (newspaperId) => {
    CustomNewspaperManager.removeCustomNewspaper(newspaperId);
    renderCustomNewspapersList();
};

// Edit Custom Newspaper
window.editCustomNewspaper = (newspaperId) => {
    const newspapers = CustomNewspaperManager.getCustomNewspapers();
    const newspaper = newspapers.find(np => np.id === newspaperId);

    if (newspaper) {
        // Populate edit modal
        document.getElementById('editNewspaperTitle').value = newspaper.title;
        document.getElementById('editNewspaperLink').value = newspaper.link;
        document.getElementById('editNewspaperCategory').value = newspaper.category;
        document.getElementById('editNewspaperLanguage').value = newspaper.language;
        
        // Store current ID for update
        document.getElementById('editNewspaperForm').dataset.newspaperId = newspaperId;

        // Show edit modal
        const editModal = new bootstrap.Modal(document.getElementById('editNewspaperModal'));
        editModal.show();
    }
};

// Update Custom Newspaper Form
document.addEventListener('DOMContentLoaded', () => {
    const editNewspaperForm = document.getElementById('editNewspaperForm');
    if (editNewspaperForm) {
        editNewspaperForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const newspaperId = editNewspaperForm.dataset.newspaperId;
            const title = document.getElementById('editNewspaperTitle').value;
            const link = document.getElementById('editNewspaperLink').value;
            const category = document.getElementById('editNewspaperCategory').value;
            const language = document.getElementById('editNewspaperLanguage').value;

            try {
                CustomNewspaperManager.updateCustomNewspaper(newspaperId, {
                    title,
                    link,
                    category,
                    language
                });

                // Close modal
                const editModal = bootstrap.Modal.getInstance(document.getElementById('editNewspaperModal'));
                editModal.hide();

                // Show success toast
                const toast = new bootstrap.Toast(document.getElementById('successToast'));
                toast.show();

                // Re-render list
                renderCustomNewspapersList();
            } catch (error) {
                // Show error toast
                const errorToast = new bootstrap.Toast(document.getElementById('errorToast'));
                document.getElementById('errorToastMessage').textContent = error.message;
                errorToast.show();
            }
        });
    }
});
