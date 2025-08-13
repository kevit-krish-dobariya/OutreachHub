
  let editingTemplateIndex = null;

  document.addEventListener('DOMContentLoaded', () => {
    renderTemplates();
    showPage('message-templates-list-page');

    // Form submission
    const templateForm = document.getElementById('message-template-form');
    templateForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('template-name').value.trim();
      const type = document.getElementById('template-type').value;
      const content = document.getElementById('template-content').value.trim();
      const imageUrl = document.getElementById('template-image-url').value.trim();

      const newTemplate = { name, type, content, imageUrl };

      const templates = getTemplates();
      if (editingTemplateIndex !== null) {
        templates[editingTemplateIndex] = newTemplate;
        editingTemplateIndex = null;
      } else {
        templates.push(newTemplate);
      }
      saveTemplates(templates);
      showPage('message-templates-list-page');
      renderTemplates();
    });

    // Dropdown population (campaign page)
    const campaignDropdown = document.getElementById('campaign-template');
    if (campaignDropdown) {
      renderTemplates(); // Ensure dropdown is populated
      campaignDropdown.addEventListener('change', () => {
        const templates = getTemplates();
        const selectedIndex = campaignDropdown.value;
        if (templates[selectedIndex]) {
          console.log('Selected Template:', templates[selectedIndex]);
          // You can populate a message preview field here if needed
        }
      });
    }
  });

  function showPage(pageId, mode = '') {
    document.querySelectorAll('.template-page').forEach(p => p.style.display = 'none');
    document.getElementById(pageId).style.display = 'block';

    if (pageId === 'add-edit-message-template-page') {
      document.getElementById('message-template-form-title').innerText =
        mode === 'edit' ? 'Edit Template' : 'Add New Template';

      if (mode === 'edit' && editingTemplateIndex !== null) {
        const template = getTemplates()[editingTemplateIndex];
        document.getElementById('template-name').value = template.name;
        document.getElementById('template-type').value = template.type;
        document.getElementById('template-content').value = template.content;
        document.getElementById('template-image-url').value = template.imageUrl || '';
        toggleImageField();
      } else {
        document.getElementById('message-template-form').reset();
        toggleImageField();
        editingTemplateIndex = null;
      }
    }
  }

  function toggleImageField() {
    const type = document.getElementById('template-type').value;
    const imageField = document.getElementById('template-image-field');
    imageField.classList.toggle('template-hidden', type !== 'Text & Image');
  }

  function getTemplates() {
    return JSON.parse(localStorage.getItem('messageTemplates')) || [];
  }

  function populateTemplateDropdown() {
  const dropdown = document.getElementById('campaign-template');
  if (!dropdown) return;

  const templates = getTemplates();
  dropdown.innerHTML = '<option value="">Select a Template</option>';

  templates.forEach((template, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = template.name;
    dropdown.appendChild(option);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  populateTemplateDropdown();
});

  function saveTemplates(templates) {
    localStorage.setItem('messageTemplates', JSON.stringify(templates));
  }

  function renderTemplates() {
    const templates = getTemplates();
    const tbody = document.querySelector('#message-templates-list-page table tbody');
    tbody.innerHTML = '';

    templates.forEach((t, i) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${t.name}</td>
        <td>${t.type}</td>
        <td>${t.content.length > 30 ? t.content.slice(0, 30) + '...' : t.content}</td>
        <td>
          <button class="template-btn template-btn-secondary" onclick="viewTemplate(${i})">View</button>
        </td>
      `;
      tbody.appendChild(row);
    });

    // Populate campaign dropdown
    const dropdown = document.getElementById('campaign-template');
    if (dropdown) {
      dropdown.innerHTML = `<option value="">Select a Template</option>`;
      templates.forEach((t, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = t.name;
        dropdown.appendChild(option);
      });
    }
  }

  function viewTemplate(index) {
  const template = getTemplates()[index];

  document.getElementById('template-detail-name').innerHTML = `<strong>Name:</strong> ${template.name}`;
  document.getElementById('template-detail-type').innerHTML = `<strong>Type:</strong> ${template.type}`;
  document.getElementById('template-detail-content').innerHTML = `<strong>Content:</strong> ${template.content}`;

  document.getElementById('edit-template-btn').setAttribute('onclick', `editTemplate(${index})`);
  document.getElementById('delete-template-btn').setAttribute('onclick', `deleteTemplate(${index})`);

  showPage('message-template-details-page');
}

  function editTemplate(index) {
    editingTemplateIndex = index;
    showPage('add-edit-message-template-page', 'edit');
  }

  function deleteTemplate(index) {
    if (confirm('Are you sure you want to delete this template?')) {
      const templates = getTemplates();
      templates.splice(index, 1);
      saveTemplates(templates);
      renderTemplates();
      showPage('message-templates-list-page');
    }
  }

  //Campaign Script
 
   
  // Navigate to a specific page section by showing it and hiding others
        function navigateTo(pageId) {
            const pages = document.querySelectorAll('.campaign.page');
            pages.forEach(page => page.style.display = 'none');

            const targetPage = document.getElementById(pageId);
            if (targetPage) {
                targetPage.style.display = 'block';
            }
        }

        // Placeholder for pagination
        function prevCampaignPage() {
            alert("Previous page");
        }

        function nextCampaignPage() {
            alert("Next page");
        }

        // Example delete confirmation (can be customized into modal)
        function showDeleteConfirmation() {
            const confirmDelete = confirm("Are you sure you want to delete this campaign?");
            if (confirmDelete) {
                alert("Campaign deleted!");
            }
        }

        // Placeholder functions for action buttons
        function launchCampaign() {
            alert("Launching campaign...");
        }

        function copyCampaign() {
            alert("Campaign copied!");
        }

// Get from storage
function getCampaigns() {
  return JSON.parse(localStorage.getItem('campaigns') || '[]');
}

function saveCampaigns(campaigns) {
  localStorage.setItem('campaigns', JSON.stringify(campaigns));
}

function getTemplates() {
  return JSON.parse(localStorage.getItem('messageTemplates') || '[]');
}

// Render campaigns
function renderCampaigns() {
  const campaigns = getCampaigns();
  const templates = getTemplates();
  const tbody = document.querySelector('#campaigns-table tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  campaigns.forEach((campaign, index) => {
    const tr = document.createElement('tr');

    const templateName = templates[campaign.templateId]?.name || 'Unknown';

    tr.innerHTML = `
      <td>${campaign.name}</td>
      <td>${campaign.status || 'Draft'}</td>
      <td>${templateName}</td>
      <td>${campaign.targetTags || '-'}</td>
      <td>
        <button onclick="viewCampaign(${index})" class="campaign btn btn-secondary">View</button>
        <button onclick="editCampaign(${index})" class="campaign btn btn-primary">Edit</button>
        <button onclick="deleteCampaign(${index})" class="campaign btn btn-danger">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// View/Edit/Delete handlers
function viewCampaign(index) {
  const campaigns = getCampaigns();
  const campaign = campaigns[index];

  alert(`Name: ${campaign.name}\nStatus: ${campaign.status || 'Draft'}\nTags: ${campaign.targetTags}`);
}

function editCampaign(index) {
  const campaigns = JSON.parse(localStorage.getItem('campaigns')) || [];
  const campaign = campaigns[index];

  // Prefill the form
  document.getElementById('campaign-form-title').innerText = 'Edit Campaign';
  document.getElementById('campaign-name').value = campaign.name;
  document.getElementById('campaign-template').value = campaign.templateId;
  document.getElementById('campaign-target-tags').value = campaign.targetTags || '';

  // If you added campaign status editing
  const statusField = document.getElementById('campaign-status');
  if (statusField) statusField.value = campaign.status || 'Draft';

  // Track current index for update
  window.editingCampaignIndex = index;

  // Show the form page
  navigateTo('add-edit-campaign-page');
}


function deleteCampaign(index) {
  if (confirm('Are you sure you want to delete this campaign?')) {
    const campaigns = getCampaigns();
    campaigns.splice(index, 1);
    saveCampaigns(campaigns);
    renderCampaigns();
  }
}

// Handle create/edit submit
document.getElementById('campaign-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('campaign-name').value.trim();
  const templateId = parseInt(document.getElementById('campaign-template').value);
  const targetTags = document.getElementById('campaign-target-tags').value.trim();

  const newCampaign = {
    name,
    templateId,
    targetTags,
    status: 'Draft'
  };

  const campaigns = getCampaigns();

  if (typeof window.editingCampaignIndex === 'number') {
    campaigns[window.editingCampaignIndex] = newCampaign;
    window.editingCampaignIndex = null;
  } else {
    campaigns.push(newCampaign);
  }

  saveCampaigns(campaigns);
  renderCampaigns();
  navigateTo('campaigns-list-page');
});

// Initial load
 window.addEventListener('DOMContentLoaded', () => {
  renderCampaigns();
 });
