// Favorite Management
const FavoriteManager = {
    KEY: 'newsflow_favorites',

    // Get all favorite sources
    getFavorites() {
        try {
            const favorites = localStorage.getItem(this.KEY);
            return favorites ? JSON.parse(favorites) : [];
        } catch (error) {
            console.error('Error getting favorites:', error);
            return [];
        }
    },

    // Add a source to favorites
    addFavorite(sourceId) {
        try {
            const favorites = new Set(this.getFavorites());
            favorites.add(sourceId);
            localStorage.setItem(this.KEY, JSON.stringify(Array.from(favorites)));
        } catch (error) {
            console.error('Error adding favorite:', error);
        }
    },

    // Remove a source from favorites
    removeFavorite(sourceId) {
        try {
            const favorites = new Set(this.getFavorites());
            favorites.delete(sourceId);
            localStorage.setItem(this.KEY, JSON.stringify(Array.from(favorites)));
        } catch (error) {
            console.error('Error removing favorite:', error);
        }
    },

    // Check if a source is a favorite
    isFavorite(sourceId) {
        try {
            const favorites = this.getFavorites();
            return favorites.includes(sourceId);
        } catch (error) {
            console.error('Error checking favorite:', error);
            return false;
        }
    }
};

// Custom Newspaper Management
const CustomNewspaperManager = {
    KEY: 'newsflow_custom_newspapers',

    // Get all custom newspapers
    getCustomNewspapers() {
        const customNewspapers = localStorage.getItem(this.KEY);
        return customNewspapers ? JSON.parse(customNewspapers) : [];
    },

    // Add a custom newspaper
    addCustomNewspaper(newspaper) {
        const customNewspapers = this.getCustomNewspapers();
        customNewspapers.push(newspaper);
        localStorage.setItem(this.KEY, JSON.stringify(customNewspapers));
    },

    // Remove a custom newspaper
    removeCustomNewspaper(newspaperId) {
        let customNewspapers = this.getCustomNewspapers();
        customNewspapers = customNewspapers.filter(np => np.id !== newspaperId);
        localStorage.setItem(this.KEY, JSON.stringify(customNewspapers));
    }
};

// Enhanced category-specific newspaper management
const CategoryNewspaperManager = {
    // Get newspapers for a specific category
    getNewspapersByCategory: function(category) {
        // Combine default and custom newspapers
        const allSources = [
            ...data.sources,
            ...CustomNewspaperManager.getCustomNewspapers()
        ];

        // Filter newspapers by category
        return allSources.filter(source => 
            source.category.toLowerCase() === category.toLowerCase()
        );
    },

    // Render newspapers for a specific category
    renderCategoryNewspapers: function(category) {
        // Get news sources container and empty state container
        const newsSourcesContainer = document.getElementById('newsSources');
        const emptyStateContainer = document.getElementById('emptyStateContainer');
        
        if (!newsSourcesContainer || !emptyStateContainer) {
            console.error('Required DOM elements not found');
            return;
        }
        
        // Clear existing sources
        newsSourcesContainer.innerHTML = ''; 
        
        // Get newspapers for the category
        const categoryNewspapers = this.getNewspapersByCategory(category);

        // Handle empty state
        if (categoryNewspapers.length === 0) {
            emptyStateContainer.classList.remove('d-none');
            newsSourcesContainer.classList.add('d-none');
            
            // Update empty state text
            const emptyStateTitle = emptyStateContainer.querySelector('h4');
            const emptyStateSubtitle = emptyStateContainer.querySelector('p');
            
            if (emptyStateTitle) emptyStateTitle.textContent = `No ${category} Newspapers`;
            if (emptyStateSubtitle) emptyStateSubtitle.textContent = `Looks like there are no ${category} newspapers yet.`;
            
            // Pre-fill category in add newspaper modal
            const addFirstNewspaperBtn = document.getElementById('addFirstNewspaperBtn');
            const categorySelect = document.getElementById('customNewspaperCategory');
            
            if (addFirstNewspaperBtn) {
                addFirstNewspaperBtn.onclick = () => {
                    if (categorySelect) {
                        categorySelect.value = category.toLowerCase();
                    }
                };
            }
        } else {
            // Hide empty state
            emptyStateContainer.classList.add('d-none');
            newsSourcesContainer.classList.remove('d-none');

            // Render newspapers
            categoryNewspapers.forEach(source => {
                const sourceCard = createSourceCard(source);
                newsSourcesContainer.appendChild(sourceCard);
            });

            // Add "Add New Newspaper" card at the end
            this.addNewNewspaperCard(category);
        }
    },

    // Add a special card to add new newspapers in the category
    addNewNewspaperCard: function(category) {
        const newsSourcesContainer = document.getElementById('newsSources');
        
        if (!newsSourcesContainer) {
            console.error('News sources container not found');
            return;
        }
        
        // Create "Add Newspaper" card
        const addNewspaperCard = document.createElement('div');
        addNewspaperCard.className = 'col';
        addNewspaperCard.innerHTML = `
            <div class="card news-card shadow-sm text-center add-newspaper-card" 
                 data-category="${category}" 
                 data-bs-toggle="modal" 
                 data-bs-target="#customNewspaperModal">
                <div class="card-body d-flex flex-column justify-content-center align-items-center">
                    <i class="bi bi-plus-circle text-primary mb-2" style="font-size: 2rem;"></i>
                    <h6 class="card-title">Add ${category} Newspaper</h6>
                    <small class="text-muted">Expand your news sources</small>
                </div>
            </div>
        `;

        // Add click event to pre-fill category in modal
        addNewspaperCard.addEventListener('click', () => {
            const categorySelect = document.getElementById('customNewspaperCategory');
            if (categorySelect) {
                categorySelect.value = category.toLowerCase();
            }
        });

        newsSourcesContainer.appendChild(addNewspaperCard);
    },

    // Setup category tab click events
    setupCategoryTabEvents: function() {
        const categoryTabs = document.getElementById('categoryTabs');
        const addCategoryBtn = document.getElementById('addCategoryBtn');
        
        if (!categoryTabs) {
            console.error('Category tabs container not found');
            return;
        }
        
        categoryTabs.addEventListener('click', (event) => {
            // Prevent default link behavior
            event.preventDefault();
            
            // Check if a category tab was clicked
            const categoryLink = event.target.closest('.nav-link');
            if (!categoryLink) return;

            // Remove active class from all tabs
            categoryTabs.querySelectorAll('.nav-link').forEach(tab => {
                tab.classList.remove('active');
            });

            // Add active class to clicked tab
            categoryLink.classList.add('active');

            // Get selected category
            const category = categoryLink.dataset.category;

            // Render newspapers for the selected category
            if (category === 'all') {
                loadNewsSources(); // Default loading of all sources
            } else {
                this.renderCategoryNewspapers(category);
            }

            // Smooth scroll to ensure the clicked tab is visible
            categoryLink.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest', 
                inline: 'center' 
            });
        });

        // Add category button click handler
        if (addCategoryBtn) {
            addCategoryBtn.addEventListener('click', () => {
                // Pre-fill modal for adding a new newspaper
                const categorySelect = document.getElementById('customNewspaperCategory');
                if (categorySelect) {
                    categorySelect.value = 'general'; // Default category
                }
            });
        }
    }
};

// Populate category tabs
function populateCategoryTabs() {
    const categoryTabs = document.getElementById('categoryTabs');
    
    if (!categoryTabs) {
        console.error('Category tabs container not found');
        return;
    }

    // Clear existing tabs except the "All" tab
    const allTab = categoryTabs.querySelector('[data-category="all"]').closest('.nav-item');
    categoryTabs.innerHTML = '';
    categoryTabs.appendChild(allTab);

    // Collect unique categories from sources and custom newspapers
    const categories = new Set([
        ...data.categories,
        ...new Set(data.sources.map(source => source.category.toLowerCase())),
        ...new Set(CustomNewspaperManager.getCustomNewspapers().map(np => np.category.toLowerCase()))
    ]);

    // Add category tabs dynamically
    categories.forEach(category => {
        if (category.toLowerCase() !== 'all') {
            const categoryTab = document.createElement('li');
            categoryTab.className = 'nav-item me-2';
            categoryTab.innerHTML = `
                <a class="nav-link" href="#" data-category="${category.toLowerCase()}">
                    ${category}
                </a>
            `;
            categoryTabs.appendChild(categoryTab);
        }
    });

    // Setup category tab click events
    CategoryNewspaperManager.setupCategoryTabEvents();
}

// Lazy Pagination Configuration
const LazyPagination = {
    itemsPerPage: 12,
    currentPage: 1,
    allSources: [],
    isFavoritesPage: false,

    // Initialize pagination
    init(sources, isFavoritesPage = false) {
        this.allSources = sources;
        this.currentPage = 1;
        this.isFavoritesPage = isFavoritesPage;
    },

    // Get paginated sources
    getPaginatedSources() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return this.allSources.slice(startIndex, endIndex);
    },

    // Check if more sources can be loaded
    hasMoreSources() {
        return (this.currentPage * this.itemsPerPage) < this.allSources.length;
    },

    // Increment page
    nextPage() {
        this.currentPage++;
    }
};

// Modify loadNewsSources for lazy pagination
async function loadNewsSources(isFavoritesPage = false) {
    const newsSourcesContainer = document.getElementById('newsSources');
    const emptyStateContainer = document.getElementById('emptyStateContainer');
    const loadMoreButton = document.getElementById('loadMoreButton');

    if (!newsSourcesContainer || !emptyStateContainer) {
        console.error('Required DOM elements not found');
        return;
    }

    // Clear existing sources and hide load more button
    newsSourcesContainer.innerHTML = '';
    emptyStateContainer.classList.add('d-none');
    if (loadMoreButton) loadMoreButton.classList.add('d-none');

    try {
        // Combine default and custom sources
        const allSources = [
            ...data.sources,
            ...CustomNewspaperManager.getCustomNewspapers()
        ];

        // Filter sources if on favorites page
        const sourcesToRender = isFavoritesPage 
            ? allSources.filter(source => FavoriteManager.isFavorite(source.id))
            : allSources;

        // Initialize lazy pagination
        LazyPagination.init(sourcesToRender, isFavoritesPage);

        if (sourcesToRender.length === 0) {
            emptyStateContainer.classList.remove('d-none');
            newsSourcesContainer.classList.add('d-none');
            return;
        }

        // Render first page of sources
        renderSourcePage(newsSourcesContainer, loadMoreButton);

    } catch (error) {
        console.error('Error loading news sources:', error);
        emptyStateContainer.classList.remove('d-none');
        newsSourcesContainer.classList.add('d-none');
    }
}

// Render a page of sources
function renderSourcePage(newsSourcesContainer, loadMoreButton) {
    const fragment = document.createDocumentFragment();
    const sourcesToRender = LazyPagination.getPaginatedSources();

    sourcesToRender.forEach(source => {
        const sourceCard = createSourceCard(source, LazyPagination.isFavoritesPage);
        fragment.appendChild(sourceCard);
    });

    newsSourcesContainer.appendChild(fragment);
    newsSourcesContainer.classList.remove('d-none');

    // Manage load more button
    if (loadMoreButton) {
        if (LazyPagination.hasMoreSources()) {
            loadMoreButton.classList.remove('d-none');
        } else {
            loadMoreButton.classList.add('d-none');
        }
    }
}

// Add event listener for load more button
document.addEventListener('DOMContentLoaded', () => {
    const loadMoreButton = document.getElementById('loadMoreButton');
    const newsSourcesContainer = document.getElementById('newsSources');

    if (loadMoreButton && newsSourcesContainer) {
        loadMoreButton.addEventListener('click', () => {
            // Increment page
            LazyPagination.nextPage();

            // Render next page
            renderSourcePage(newsSourcesContainer, loadMoreButton);
        });
    }
});

// Truncate text to specified length
function truncateText(text, maxLength = 15) {
    return text.length > maxLength 
        ? text.substr(0, maxLength) + '...' 
        : text;
}

// Utility function to get favicon URL
function getFaviconUrl(url, size = 64) {
    const defaultLogo = 'default-newspaper.webp';
    
    try {
        const parsedUrl = new URL(url);
        
        // Try direct favicon paths
        const faviconPaths = [
            `${parsedUrl.origin}/favicon.ico`,
            `${parsedUrl.origin}/favicon.png`,
            `${parsedUrl.origin}/apple-touch-icon.png`
        ];

        // Fallback methods
        const fallbackUrls = [
            `https://www.google.com/s2/favicons?domain=${url}&sz=${size}`,
            defaultLogo
        ];

        // Combine all potential favicon sources
        return [...faviconPaths, ...fallbackUrls];
    } catch (error) {
        // If URL parsing fails, use fallback
        return [
            `https://www.google.com/s2/favicons?domain=${url}&sz=${size}`,
            defaultLogo
        ];
    }
}

// Create source card HTML
function createSourceCard(source, isFavorite = false) {
    const card = document.createElement('div');
    card.className = 'col';
    
    // Determine favicon URLs
    const faviconUrls = getFaviconUrl(source.link);

    // Create image element with multiple sources
    const faviconImg = document.createElement('img');
    faviconImg.className = 'card-img-top newspaper-favicon';
    faviconImg.alt = `${source.title} Logo`;
    faviconImg.dataset.url = source.link;

    // Try loading favicons in sequence
    let currentUrlIndex = 0;
    faviconImg.onerror = function() {
        currentUrlIndex++;
        if (currentUrlIndex < faviconUrls.length) {
            faviconImg.src = faviconUrls[currentUrlIndex];
        } else {
            // Final fallback to default logo
            faviconImg.src = 'default-newspaper.webp';
            faviconImg.onerror = null;
        }
    };

    // Set initial source
    faviconImg.src = faviconUrls[0];

    card.innerHTML = `
        <div class="card news-card shadow-sm" 
             data-id="${source.id}"
             data-category="${source.category.toLowerCase()}"
             data-language="${source.language}">
            <div class="card-body text-center">
                <h6 class="card-title mb-1">${truncateText(source.title)}</h6>
                <div class="d-flex justify-content-center align-items-center">
                    <button class="btn btn-sm btn-outline-danger favorite-toggle me-2" 
                            onclick="toggleFavorite('${source.id}', event)">
                        <i class="bi ${isFavorite ? 'bi-heart-fill text-danger' : 'bi-heart'}"></i>
                    </button>
                </div>
            </div>
        </div>
    `;

    // Insert favicon before card body
    card.querySelector('.news-card').insertBefore(faviconImg, card.querySelector('.card-body'));

    // Add click event to favicon to open website
    faviconImg.addEventListener('click', () => {
        const url = faviconImg.getAttribute('data-url');
        window.open(url, '_blank');
    });

    return card;
}

// Import data from data.json
let data = { sources: [], categories: [] };

// Attempt to load data from local storage or data.json
function loadNewsData() {
    try {
        // First, try to load from local storage
        const storedData = localStorage.getItem('newsData');
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            data.sources = parsedData.sources || [];
            data.categories = parsedData.categories || [];
            
            // Populate tabs immediately if data is in local storage
            populateCategoryTabs();
        } else {
            // If no local storage, fetch from data.json
            fetch('data.json')
                .then(response => response.json())
                .then(jsonData => {
                    data.sources = jsonData.sources || [];
                    data.categories = jsonData.categories || [];
                    
                    // Save to local storage for future use
                    localStorage.setItem('newsData', JSON.stringify(data));
                    
                    // Populate category tabs after data is loaded
                    populateCategoryTabs();
                })
                .catch(error => {
                    console.error('Error loading news data:', error);
                });
        }
    } catch (error) {
        console.error('Error loading news data:', error);
    }
}

// Optimize data loading and rendering
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load data first
        await loadNewsData();

        const currentPage = window.location.pathname;
        const isFavoritesPage = currentPage.includes('favorites.html');
        
        // Single, optimized loading call
        loadNewsSources(isFavoritesPage);
    } catch (error) {
        console.error('Initial page load error:', error);
    }
});

// Modify custom newspaper form submission
document.addEventListener('DOMContentLoaded', () => {
    const customNewspaperForm = document.getElementById('customNewspaperForm');
    
    if (customNewspaperForm) {
        customNewspaperForm.addEventListener('submit', (event) => {
            event.preventDefault();

            // Get form values with null checks
            const titleInput = document.getElementById('customNewspaperTitle');
            const linkInput = document.getElementById('customNewspaperLink');
            const categorySelect = document.getElementById('customNewspaperCategory');
            const languageSelect = document.getElementById('customNewspaperLanguage');

            // Validate inputs
            if (!titleInput || !linkInput || !categorySelect || !languageSelect) {
                console.error('One or more form elements not found');
                return;
            }

            const title = titleInput.value.trim();
            const link = linkInput.value.trim();
            const category = categorySelect.value;
            const language = languageSelect.value;

            // Validate input values
            if (!title || !link) {
                // Show error toast
                const errorToast = document.getElementById('errorToast');
                const errorToastMessage = document.getElementById('errorToastMessage');
                
                if (errorToast && errorToastMessage) {
                    errorToastMessage.textContent = 'Please fill in all required fields.';
                    new bootstrap.Toast(errorToast).show();
                }
                return;
            }

            // Create new newspaper object
            const newNewspaper = {
                id: `custom_${Date.now()}`,
                title: title,
                link: link,
                category: category,
                language: language
            };

            // Add to custom newspapers
            CustomNewspaperManager.addCustomNewspaper(newNewspaper);

            // Refresh news sources or current category view
            const activeTab = document.querySelector('#categoryTabs .nav-link.active');
            if (activeTab) {
                const category = activeTab.dataset.category;
                if (category === 'all') {
                    loadNewsSources();
                } else {
                    CategoryNewspaperManager.renderCategoryNewspapers(category);
                }
            }

            // Close modal
            const modalElement = document.getElementById('customNewspaperModal');
            if (modalElement) {
                const modalInstance = bootstrap.Modal.getInstance(modalElement);
                if (modalInstance) {
                    modalInstance.hide();
                } else {
                    // If no instance exists, create one
                    new bootstrap.Modal(modalElement).hide();
                }
            }

            // Show success toast
            const successToast = document.getElementById('successToast');
            if (successToast) {
                new bootstrap.Toast(successToast).show();
            }

            // Reset form
            customNewspaperForm.reset();
        });
    }
});

// Toggle favorite status
function toggleFavorite(sourceId, event) {
    // If event is not passed, try to get it from the current context
    if (!event) {
        event = window.event || arguments.callee.caller.arguments[0];
    }

    // Ensure we have a valid event target
    const favoriteButton = event ? event.currentTarget || event.target : 
        document.querySelector(`.favorite-toggle[data-id="${sourceId}"]`);
    
    if (!favoriteButton) {
        console.error('Favorite button not found for source:', sourceId);
        return;
    }

    const heartIcon = favoriteButton.querySelector('i');
    
    // Check current favorite status
    const isFavorite = FavoriteManager.isFavorite(sourceId);
    
    if (isFavorite) {
        // Remove from favorites
        FavoriteManager.removeFavorite(sourceId);
        heartIcon.classList.remove('bi-heart-fill', 'text-danger');
        heartIcon.classList.add('bi-heart');
    } else {
        // Add to favorites
        FavoriteManager.addFavorite(sourceId);
        heartIcon.classList.remove('bi-heart');
        heartIcon.classList.add('bi-heart-fill', 'text-danger');
    }

    // If on favorites page, remove the card
    const currentPage = window.location.pathname;
    if (currentPage.includes('favorites.html')) {
        const card = favoriteButton.closest('.card');
        card.closest('.col').remove();

        // Show empty state if no favorites left
        const newsSourcesContainer = document.getElementById('newsSources');
        if (newsSourcesContainer && newsSourcesContainer.children.length === 0) {
            newsSourcesContainer.innerHTML = `
                <div class="col-12 text-center mt-5">
                    <i class="bi bi-heart text-muted" style="font-size: 4rem;"></i>
                    <h4 class="mt-3">No Favorite Newspapers</h4>
                    <p class="text-muted">Start adding your favorite newspapers!</p>
                    <a href="index.html" class="btn btn-primary">Explore Newspapers</a>
                </div>
            `;
        }
    }
}

// Advanced Newspaper Search Functionality
function searchNewspapers(query, options = {}) {
    // Ensure query is trimmed and lowercase
    query = query.trim().toLowerCase();

    // If query is empty, return all sources
    if (!query) {
        return data.sources;
    }

    // Default search options
    const defaultOptions = {
        searchFields: ['title', 'category', 'language'],
        matchType: 'partial'  // 'partial' or 'exact'
    };
    
    // Merge default options with provided options
    const searchOptions = { ...defaultOptions, ...options };

    // Combine sources from data and custom newspapers
    const allSources = [
        ...data.sources,
        ...CustomNewspaperManager.getCustomNewspapers()
    ];

    // Perform search
    const searchResults = allSources.filter(source => {
        // Check each specified search field
        return searchOptions.searchFields.some(field => {
            const sourceValue = String(source[field] || '').toLowerCase();
            
            // Match type logic
            if (searchOptions.matchType === 'exact') {
                return sourceValue === query;
            } else {
                // Partial match
                return sourceValue.includes(query);
            }
        });
    });

    return searchResults;
}

// Search UI Integration
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('newspaperSearchInput');
    const newsSourcesContainer = document.getElementById('newsSources');
    
    if (searchInput && newsSourcesContainer) {
        searchInput.addEventListener('input', function() {
            const query = this.value;
            const searchResults = searchNewspapers(query);

            // Clear existing sources
            newsSourcesContainer.innerHTML = '';

            // Render search results
            if (searchResults.length > 0) {
                searchResults.forEach(source => {
                    const sourceCard = createSourceCard(source);
                    newsSourcesContainer.appendChild(sourceCard);
                });
            } else {
                // Show empty state when no results
                newsSourcesContainer.innerHTML = `
                    <div class="col-12 text-center mt-5">
                        <i class="bi bi-search text-muted" style="font-size: 4rem;"></i>
                        <h4 class="mt-3">No Newspapers Found</h4>
                        <p class="text-muted">Try a different search term or explore other categories.</p>
                    </div>
                `;
            }
        });
    }
});
