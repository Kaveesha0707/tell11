const API_URL = "/api/keywords";

const channelForm = document.getElementById("channelForm");
const channelInput = document.getElementById("channelInput");
const channelList = document.getElementById("channelList");
const themeToggle = document.getElementById("themeToggle");

// Toggle Dark Theme
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
});

// Fetch and display channel IDs
async function fetchChannels() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

    const channels = await response.json();
    channelList.innerHTML = ""; // Clear existing list
    channels.forEach((channel) => {
      const li = document.createElement("li");
      li.innerHTML = `${channel.channel_id}&nbsp;&nbsp;&nbsp;&nbsp;`;

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "DELETE";
      deleteButton.classList.add("remove-btn");
      deleteButton.onclick = () => deleteChannel(channel._id);

      li.appendChild(deleteButton);
      channelList.appendChild(li);
    });
  } catch (err) {
    console.error(`Error fetching channels: ${err.message}`);
  }
}

// Add a new channel ID
async function addChannel(event) {
  event.preventDefault();

  const channel_id = channelInput.value.trim();
  if (!channel_id) return alert("Please enter a channel ID!");

  const submitButton = channelForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ channel_id }),
    });

    if (response.status === 201) {
      channelInput.value = "";
      fetchChannels(); // Refresh the list
    } else {
      const error = await response.text();
      alert(`Error: ${error}`);
    }
  } catch (err) {
    console.error(`Error adding channel: ${err.message}`);
  } finally {
    submitButton.disabled = false;
  }
}

// Delete a channel ID
async function deleteChannel(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    fetchChannels();
  } catch (err) {
    console.error(`Error deleting channel: ${err.message}`);
  }
}

// Initial fetch
fetchChannels();

// Event listener for adding a channel
channelForm.addEventListener("submit", addChannel);
