const params = new URLSearchParams(window.location.search);
const jumpName = decodeURIComponent(params.get('name'));
document.title = jumpName;
fetch('./js/jumps_data.csv')
    .then(response => response.text())
    .then(data => {
        Papa.parse(data, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: function (results) {
                const jumpData = results.data.find(row => row.name.toString() == jumpName);
                if (jumpData) {
                    displayJumpDetails(jumpData);
                } else {
                    document.body.innerHTML = '<h1 class="py-5 px-5 text-center">Jump not found, please try refreshing the page. If you found this page due to a bug, please report it in our <a href="https://discord.gg/CxqUN9E" target="_blank" class="underlined-link">discord server.</a></h1>';
                }
            },
            error: function (error) {
                document.body.innerHTML = `<h1 class="py-5 px-5 text-center">An error occured while trying to parse the csv file, please try refreshing the page. If the error repeats, please report it in our <a href="https://discord.gg/CxqUN9E" target="_blank" class="underlined-link">discord server.</a></h1><h3 class="text-center">Error: ${error}</h3>`;
                console.error('Error parsing the CSV data:', error);
            }
        });
    })
    .catch(error => {
        document.body.innerHTML = `<h1 class="py-5 px-5 text-center">An error occured while trying to parse the csv file, please try refreshing the page. If the error repeats, please report it in our <a href="https://discord.gg/CxqUN9E" target="_blank" class="underlined-link">discord server.</a></h1><h3 class="text-center">Error: ${error}</h3>`;
        console.error('Error fetching the CSV data:', error);
    });
    
function displayJumpDetails(jumpData) {
    document.getElementById('jump-name').textContent = `${jumpData.name} - ${jumpData.location}`;
    document.getElementById('jump-difficulty').textContent = `Difficulty: ${jumpData.diff || 'N/A'}`;
    document.getElementById('jump-tier').textContent = `Tier: ${jumpData.tier || 'N/A'}`;
    if (jumpData.type) {
        document.getElementById('jump-types').textContent = `Type: ${jumpData.type || 'N/A'}`;
    } else {
        const jumpTypeElement = document.getElementById('jump-types').parentElement;
        jumpTypeElement.parentElement.removeChild(jumpTypeElement);
    }
    
    if (jumpData.finder) {
        document.getElementById('jump-finder').textContent = `Finder: ${jumpData.finder || 'N/A'}`;
    } else {
        const jumpFinderElement = document.getElementById('jump-finder').parentElement;
        jumpFinderElement.parentElement.removeChild(jumpFinderElement);
    }
    
    if (jumpData.prover) {
        document.getElementById('jump-prover').textContent = `Prover: ${jumpData.prover || 'N/A'}`;
    } else {
        const jumpProverElement = document.getElementById('jump-prover').parentElement;
        jumpProverElement.parentElement.removeChild(jumpProverElement);
    }
            
    // Handling the extra content
    if (jumpData.extra){
        const extraContent = jumpData.extra || 'N/A';
        const linkPattern = /(https?:\/\/[^\s]+)/g;
        const matches = extraContent.match(linkPattern);
        const infoText = document.getElementById("info-text");
        infoText.textContent = 'Extra Information';

        let extraText = extraContent;
        let extraLink = null;
        
        if (matches && matches.length > 0) {
            extraLink = matches[matches.length - 1];
            extraText = extraContent.replace(extraLink, '').trim();
        }
        
        document.getElementById('jump-extra').textContent = `${extraText}`;
        const jumpExtraElement = document.getElementById('jump-extra');
        jumpExtraElement.parentElement.classList.add("border", "border-info", "border-5", "rounded", "p-3");
        
        if (extraLink) {
            const container = document.createElement("div");
            container.className = "embed-responsive";
            const loadingSpinner = document.createElement("div");
            loadingSpinner.classList.add("loading-spinner");

            const iframe = document.createElement("iframe");
            iframe.setAttribute("src", extraLink);
            iframe.setAttribute("width", "560");
            iframe.setAttribute("height", "315");
            iframe.setAttribute("frameborder", "0");
            iframe.setAttribute("allowfullscreen", "");
            iframe.classList.add("embed-responsive-item");

            jumpExtraElement.parentElement.appendChild(container);
            container.appendChild(loadingSpinner);
            container.appendChild(iframe);
        }
    }
    else{
        const jumpExtraElement = document.getElementById('jump-extra').parentElement;
        const infoText = document.getElementById("info-text");
        jumpExtraElement.parentElement.removeChild(jumpExtraElement);
        infoText.parentElement.removeChild(infoText);
    }

    document.getElementById('jump-server').textContent = `Server: ${jumpData.server || 'N/A'}`;
    
    const iframe = document.createElement("iframe");
    document.getElementById("jump-vid-container").append(iframe);
    iframe.setAttribute("id", "jump-link");
    iframe.setAttribute("width", "560");
    iframe.setAttribute("height", "315");
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("allowfullscreen", "");
    iframe.setAttribute("src", jumpData.links);
    iframe.classList.add("embed-responsive-item");
};