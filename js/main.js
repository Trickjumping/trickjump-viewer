const toggleFiltersButton = document.getElementById('toggle-filters');
const filtersContent = document.getElementById('filters');
const autoApplyCheckbox = document.getElementById('auto-apply');
const applyFiltersButton = document.getElementById('apply-filters');
const removeFiltersButton = document.getElementById('remove-filters');
const locationFilter = document.getElementById('location-filter');
const difficultyFilter = document.getElementById('difficulty-filter');
const tierFilter = document.getElementById('tier-filter');
const typeFilter = document.getElementById('type-filter');
const serverFilter = document.getElementById('server-filter');
const tableBody = document.getElementById('table-body');
const firstPageButton = document.getElementById('first-page');
const prevPageButton = document.getElementById('prev-page');
const nextPageButton = document.getElementById('next-page');
const lastPageButton = document.getElementById('last-page');
const currentPageNumber = document.getElementById('page-number');
const maxPageSpan = document.getElementById('max-page');
const nameFilter = document.getElementById('name-filter');
const finderFilter = document.getElementById('finder-filter');
const proverFilter = document.getElementById('prover-filter');
const entriesPerPage = 20;
let currentPage = 1;
let maxPage = 1;
let sortedData = [];

// Animations for the apply checkbox button
autoApplyCheckbox.addEventListener('change', function () {
    if (autoApplyCheckbox.checked) {
        applyFiltersButton.classList.remove('fade-in');
        applyFiltersButton.classList.add('fade-out');
        setTimeout(() => {
            applyFiltersButton.style.display = 'none';
        }, 300);
    } else {
        applyFiltersButton.style.display = 'inline-block';
        setTimeout(() => {
            applyFiltersButton.classList.remove('fade-out');
            applyFiltersButton.classList.add('fade-in');
        }, 10);
    }
});

toggleFiltersButton.addEventListener('click', function () {
    if (filtersContent.style.display == 'block') {
        filtersContent.style.display = 'none';
        toggleFiltersButton.innerText = 'Show Filters';
    } else {
        filtersContent.style.display = 'block';
        toggleFiltersButton.innerText = 'Hide Filters';
    }
});

removeFiltersButton.addEventListener('click', function () {
    nameFilter.value = '';
    locationFilter.textContent = 'All Locations (Default)';
    difficultyFilter.textContent = 'All Difficulties (Default)';
    tierFilter.textContent = 'All Tiers (Default)';
    typeFilter.textContent = 'All Types (Default)';
    serverFilter.textContent = 'All Servers (Default)';
    finderFilter.value = '';
    proverFilter.value = '';
    currentPage = 1;
    displayPage(currentPage);
});

applyFiltersButton.addEventListener('click', function () {
    currentPage = 1;
    displayPage(currentPage);
});

fetch('./js/jumps_data.csv')
    .then(response => response.text())
    .then(data => {
        Papa.parse(data, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: function (results) {
                sortedData = sortData(results.data);
                maxPage = Math.ceil(sortedData.length / entriesPerPage);
                displayPage(currentPage);
                createFilters(sortedData);
            },
            error: function (error) {
                console.error('Error parsing the CSV data:', error);
            }
        });
    })
    .catch(error => console.error('Error fetching the CSV data:', error));

function sortData(data) {
    const difficultyOrder = [];
    const uniqueDifficulties = new Set(data.map(row => row.diff));

    uniqueDifficulties.forEach(difficulty => {
        difficultyOrder.push(difficulty);
    });

    return data.sort((a, b) => {
        const nameA = a.name ? a.name.toString() : '';
        const nameB = b.name ? b.name.toString() : '';
        const indexA = difficultyOrder.indexOf(a.diff);
        const indexB = difficultyOrder.indexOf(b.diff);

        if (indexA != -1 && indexB != -1) {
            if (indexA == indexB) {
                return nameA.localeCompare(nameB);
            } else {
                return indexA - indexB;
            }
        }

        if (indexA != -1) return -1;
        if (indexB != -1) return 1;

        return a.diff.localeCompare(b.diff);
    });
}

function displayPage(page) {
    currentPageNumber.value = currentPage;
    const filteredData = applyFilters();
    tableBody.innerHTML = '';
    const start = (page - 1) * entriesPerPage;
    const end = start + entriesPerPage;
    const pageData = filteredData.slice(start, end);
    
    pageData.forEach(row => {
        const tr = document.createElement('tr');
        const tdName = document.createElement('td');
        const nameLink = document.createElement('a');
        nameLink.setAttribute('href', `jump-details.html?name=${encodeURIComponent(row.name)}`);
        nameLink.textContent = `${row.name}`;
        const tdDiff = document.createElement('td');
        tdDiff.classList.add("text-center", "text-sm-start");
        tdDiff.textContent = `${row.diff}`;

        tdName.appendChild(nameLink);
        tr.appendChild(tdName);
        tr.appendChild(tdDiff);
        tableBody.appendChild(tr);
    });
    maxPage = Math.ceil(filteredData.length / entriesPerPage);
    updatePaginationControls();
}

function updatePaginationControls() {
    maxPageSpan.textContent = maxPage.toString();
    currentPageNumber.setAttribute("max", maxPage);
    firstPageButton.classList.toggle('disabled', currentPage == 1);
    prevPageButton.classList.toggle('disabled', currentPage == 1);
    nextPageButton.classList.toggle('disabled', currentPage == maxPage);
    lastPageButton.classList.toggle('disabled', currentPage == maxPage);
}

firstPageButton.addEventListener('click', function () {
    if (currentPage > 1) {
        currentPage = 1;
        displayPage(currentPage);
    }
});

prevPageButton.addEventListener('click', function () {
    if (currentPage > 1) {
        currentPage--;
        displayPage(currentPage);
    }
});

nextPageButton.addEventListener('click', function () {
    if (currentPage < maxPage) {
        currentPage++;
        displayPage(currentPage);
    }
});

lastPageButton.addEventListener('click', function () {
    if (currentPage < maxPage) {
        currentPage = maxPage;
        displayPage(currentPage);
    }
});

currentPageNumber.addEventListener('change', function() {
    const inputPage = parseInt(currentPageNumber.value)
    if (inputPage >= 1 && inputPage <= maxPage){
        currentPage = inputPage;
        displayPage(currentPage);
    }
})

function applyFilters() {
    const nameValue = nameFilter.value.toLowerCase();
    const locationValue = locationFilter.textContent.toLowerCase();
    const difficultyValue = difficultyFilter.textContent.toLowerCase();
    const tierValue = tierFilter.textContent.toLowerCase();
    const typeValue = typeFilter.textContent.toLowerCase();
    const serverValue = serverFilter.textContent.toLowerCase();
    const finderValue = finderFilter.value.toLowerCase();
    const proverValue = proverFilter.value.toLowerCase();

    return sortedData.filter(row => {
        const nameMatch = !nameValue || row.name.toString().toLowerCase().includes(nameValue);
        const locationMatch = locationValue.includes('all') || (row.location && row.location.toLowerCase().includes(locationValue));
        const difficultyMatch = difficultyValue.includes('all') || (row.diff && row.diff.toLowerCase().includes(difficultyValue));
        const tierMatch = tierValue.includes('all') || (row.tier && row.tier.toLowerCase().includes(tierValue));
        const typeMatch = typeValue.includes('all') || (row.type && row.type.toLowerCase().includes(typeValue));
        const serverMatch = serverValue.includes('all') || (row.server && row.server.toLowerCase().includes(serverValue));
        const finderMatch = !finderValue || (row.finder && row.finder.toLowerCase().includes(finderValue));
        const proverMatch = !proverValue || (row.prover && row.prover.toLowerCase().includes(proverValue));

        return nameMatch && locationMatch && difficultyMatch && tierMatch && typeMatch && serverMatch && finderMatch && proverMatch;
    });
}

// Dynamically creates all of the filters to choose from based off the csv
function createFilters(data) {
    const uniqueLocations = new Set();
    const uniqueDifficulties = [...new Set(data.map(row => row.diff))];
    const uniqueTiers = [...new Set(data.map(row => row.tier))];
    const uniqueTypes = new Set();
    const uniqueServers = [...new Set(data.map(row => row.server))].sort();
    data.forEach(row => {
        if (row.location) {
            row.location.split(',').forEach(location => {
                uniqueLocations.add(location.trim());
            });
        }
    });

    data.forEach(row => {
        if (row.type) {
            row.type.split(',').forEach(type => {
                uniqueTypes.add(type.trim());
            });
        } else {
            uniqueTypes.add('No type specified');
        }
    });
    populateDropdown('#location-filter', [...uniqueLocations].sort(), 'Locations');
    populateDropdown('#difficulty-filter', uniqueDifficulties, 'Difficulties');
    populateDropdown('#tier-filter', uniqueTiers, 'Tiers');
    populateDropdown('#type-filter', [...uniqueTypes].sort(), 'Types');
    populateDropdown('#server-filter', uniqueServers, 'Servers');
}

// Close the dropdown if you click off it
window.addEventListener('click', function (event) {
    document.querySelectorAll('.dropdown-list').forEach(dropdownList => {
        if (!dropdownList.parentElement.contains(event.target) && !event.target.classList.contains('filter-dropdown')) {
            dropdownList.style.display = 'none';
        }
    });
});

// Adds the selected filter to the proper dropdown menu.
function populateDropdown(dropdownSelector, values, defaultValue) {
    const dropdownButton = document.querySelector(dropdownSelector);
    const dropdownContainer = document.createElement('div');
    dropdownContainer.className = 'dropdown-container';
    const dropdownList = document.createElement('div');
    dropdownList.className = 'dropdown-list';
    dropdownButton.parentNode.insertBefore(dropdownContainer, dropdownButton.nextSibling);
    dropdownContainer.appendChild(dropdownButton);
    dropdownContainer.appendChild(dropdownList);

    // Adds the all option
    const allOption = document.createElement('div');
    allOption.className = 'dropdown-item';
    allOption.textContent = `All ${defaultValue} (Default)`;
    dropdownList.appendChild(allOption);

    values.forEach(value => {
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        item.style.padding = '0.5rem 1rem';
        item.style.cursor = 'pointer';
        item.textContent = value;
        dropdownList.appendChild(item);
    });

    dropdownButton.addEventListener('click', function () {
        document.querySelectorAll('.dropdown-list').forEach(list => {
            if (list != dropdownList) {
                list.style.display = 'none';
            }
        });
        dropdownList.style.width = (dropdownButton.offsetWidth - 10) + 'px';
        dropdownList.style.marginLeft = '5px';
        dropdownList.style.display = dropdownList.style.display == 'none' ? 'block' : 'none';
    });

    window.addEventListener('resize', function () {
        if (dropdownList.style.display == 'block') {
            dropdownList.style.width = (dropdownButton.offsetWidth - 10) + 'px';
            dropdownList.style.marginLeft = '5px';
        }
        if (window.innerWidth < 768 && dropdownList.style.display == 'block') {
            if (filtersContent.style.display != 'block') {
                dropdownList.style.display = 'none';
            }
        }
    });

    dropdownList.addEventListener('click', function (event) {
        if (event.target.classList.contains('dropdown-item')) {
            dropdownButton.textContent = event.target.textContent;
            dropdownList.style.display = 'none';
            
            if (autoApplyCheckbox.checked) {
                currentPage = 1;
                displayPage(currentPage);
            }
        }
    });
}

// Apply filter on text field change
[nameFilter, finderFilter, proverFilter].forEach(filter => {
    filter.addEventListener('input', () => {
        if (autoApplyCheckbox.checked) {
            currentPage = 1;
            displayPage(currentPage);
        };
    });
});
// Apply filter on change of selected dropdown
[locationFilter, difficultyFilter, tierFilter, typeFilter, serverFilter].forEach(filter => {
    filter.addEventListener('click', () => {
        if (autoApplyCheckbox.checked) {
            currentPage = 1;
            displayPage(currentPage);
        }
    });
});

document.querySelectorAll('.tooltip-icon').forEach(icon => {
    icon.addEventListener('mouseover', function () {
        const tooltipText = this.querySelector('.tooltip-text');
        const iconRect = this.getBoundingClientRect();
        const tooltipRect = tooltipText.getBoundingClientRect();
        
        // Check for the height of the tooltip is too close to the top of the browser window
        if (iconRect.top < tooltipRect.height + 20) {
            tooltipText.style.top = `${iconRect.height + 10}px`;
            tooltipText.style.bottom = 'auto';
            this.dataset.direction = 'bottom';
        } else {
            tooltipText.style.bottom = `${iconRect.height + 10}px`;
            tooltipText.style.top = 'auto';
            this.dataset.direction = 'top';
        }
    });
});

