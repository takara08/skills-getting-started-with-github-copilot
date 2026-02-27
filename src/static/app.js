document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // 参加者リストを生成
        let participantsHTML = "";
        if (details.participants && details.participants.length > 0) {
          participantsHTML = `
            <div class="participants-section">
              <strong>Participants:</strong>
              <ul class="participants-list no-bullets">
                ${details.participants.map(p => `
                  <li class="participant-item">
                    <span class="participant-name">${p}</span>
                    <button class="remove-participant-btn" title="Remove" data-activity="${name}" data-email="${p}">
                      <span aria-hidden="true">🗑️</span>
                    </button>
                  </li>
                `).join("")}
              </ul>
            </div>
          `;
        } else {
          participantsHTML = `
            <div class="participants-section empty">
              <strong>Participants:</strong>
              <span class="no-participants">No participants yet</span>
            </div>
          `;
        }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          ${participantsHTML}
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  
       // 削除ボタンのイベントリスナーを後から付与
       setTimeout(() => {
         const removeBtns = activityCard.querySelectorAll('.remove-participant-btn');
         removeBtns.forEach(btn => {
           btn.addEventListener('click', async (e) => {
             e.preventDefault();
             const activityName = btn.getAttribute('data-activity');
             const email = btn.getAttribute('data-email');
             if (!activityName || !email) return;
             if (!confirm(`Remove ${email} from ${activityName}?`)) return;
             try {
               const response = await fetch(`/activities/${encodeURIComponent(activityName)}/remove?email=${encodeURIComponent(email)}`, {
                 method: 'POST',
               });
               const result = await response.json();
               if (response.ok) {
                 messageDiv.textContent = result.message;
                 messageDiv.className = 'success';
                 fetchActivities();
               } else {
                 messageDiv.textContent = result.detail || 'An error occurred';
                 messageDiv.className = 'error';
               }
               messageDiv.classList.remove('hidden');
               setTimeout(() => {
                 messageDiv.classList.add('hidden');
               }, 5000);
             } catch (error) {
               messageDiv.textContent = 'Failed to remove participant. Please try again.';
               messageDiv.className = 'error';
               messageDiv.classList.remove('hidden');
               console.error('Error removing participant:', error);
             }
           });
         });
       }, 0);
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
