document.addEventListener("DOMContentLoaded", async () => {
    const videoGrid = document.getElementById("video-grid");
    const videoContainer = document.getElementById("video-container");
    const videoPlayer = document.getElementById("videoPlayer");
    const videoSource = document.getElementById("videoSource");
    const videoTitle = document.getElementById("video-title");
    const videoDescription = document.getElementById("video-description");

    try {
        // Fetch the list of metadata files
        const listResponse = await fetch("metadataList.json");
        const listData = await listResponse.json();

        // Loop through each metadata file
        for (const file of listData.files) {
            const response = await fetch(file);
            const video = await response.json();

            // Create thumbnail div
            const div = document.createElement("div");
            div.classList.add("video-thumbnail");

            // Thumbnail image (Lazy Loading)
            const img = document.createElement("img");
            img.setAttribute("data-src", video.thumbnail); // Lazy-load
            img.alt = video.title;

            // Play button
            const playButton = document.createElement("button");
            playButton.classList.add("play-button");
            playButton.innerText = "Play";

            // Video quality overlay
            const qualityOverlay = document.createElement("div");
            qualityOverlay.classList.add("quality-overlay");
            qualityOverlay.innerText = video.quality; // Set video quality (HD, 4K, etc.)

            // Append elements
            div.appendChild(img);
            div.appendChild(playButton);
            div.appendChild(qualityOverlay); // Add the overlay here
            videoGrid.appendChild(div);

            // Lazy-load images
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.src = entry.target.getAttribute("data-src");
                        entry.target.classList.add("loaded");
                        observer.unobserve(entry.target);
                    }
                });
            });
            observer.observe(img);

            // Play video on thumbnail click
            div.onclick = () => {
                // Set the video source to the PixelDrain URL from the JSON
                videoSource.src = video.url;
                videoPlayer.load();
                videoPlayer.play();
            
                // Show video player in fullscreen mode
                videoContainer.classList.add("active");
            
                // Update metadata
                videoTitle.innerText = video.title;
                videoDescription.innerText = `${video.description} (Duration: ${video.duration})`;
                document.getElementById("video-actors").innerText = video.actors.join(", ");
                document.getElementById("video-directors").innerText = video.directors.join(", ");
            };
            
        }
    } catch (error) {
        console.error("Error loading metadata:", error);
    }

    // Hide video player when video ends
    videoPlayer.onended = () => {
        videoContainer.classList.remove("active");
    };

    // Hide player when clicking outside the video
    videoContainer.addEventListener("click", (event) => {
        if (event.target === videoContainer) {
            videoContainer.classList.remove("active");
            videoPlayer.pause();
        }
    });

    // Search functionality
    const searchBar = document.getElementById("search-bar");
    searchBar.addEventListener("input", () => {
        const searchTerm = searchBar.value.toLowerCase();
        const videoThumbnails = document.querySelectorAll(".video-thumbnail");

        videoThumbnails.forEach((thumbnail) => {
            const title = thumbnail.querySelector("img").alt.toLowerCase();
            const category = thumbnail.getAttribute("data-category").toLowerCase();

            // If search term matches either title or category, show the video
            if (title.includes(searchTerm) || category.includes(searchTerm)) {
                thumbnail.style.display = "block";
            } else {
                thumbnail.style.display = "none";
            }
        });
    });

    // Category filter functionality
    const categoryButtons = document.querySelectorAll(".category-btn");
    categoryButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const category = button.getAttribute("data-category");
            const videoThumbnails = document.querySelectorAll(".video-thumbnail");

            videoThumbnails.forEach((thumbnail) => {
                const videoCategory = thumbnail.getAttribute("data-category");

                // If category matches, show the video, else hide it
                if (category === videoCategory || category === "all") {
                    thumbnail.style.display = "block";
                } else {
                    thumbnail.style.display = "none";
                }
            });
        });
    });
});
