// ── VAULT – GOOGLE DRIVE VERSION ───────────────────────────────────────────

const GDRIVE_KEY = 'sc_gdrive_v2';
let vaultFilter = 'All';

// Pre-populated Google Drive documents with metadata
const GDRIVE_DOCS = [
  // Formation
  { id:'articles', name:'Articles of Incorporation', category:'Formation', url:'', notes:'Filed 02/26/2024, Entity #6117165' },
  { id:'bylaws', name:'Corporate Bylaws', category:'Formation', url:'', notes:'Start Construction Inc' },
  { id:'ein', name:'EIN / Tax ID Letter (SS-4)', category:'Formation', url:'', notes:'EIN: 99-1788037, issued 03/07/2024' },
  { id:'form2553', name:'IRS Form 2553 (S-Corp Election)', category:'Formation', url:'', notes:'Effective 02/26/2024' },
  { id:'statement_inc', name:'Statement of the Incorporator', category:'Formation', url:'', notes:'Signed by Lovette Dobson, 03/07/2024' },
  { id:'biz_entity', name:'Business Entity Filing Acknowledgment', category:'Formation', url:'', notes:'CA SOS confirmation' },
  { id:'banking_res', name:'Banking Resolution', category:'Formation', url:'', notes:'Authorized signatory: Aleksandr Zakirov' },
  { id:'boir', name:'BOIR (Beneficial Ownership Report)', category:'Formation', url:'', notes:'Filed 03/10/2024, FinCEN ID: 2000-0048-0165' },
  // Corporate
  { id:'meeting_min', name:'Meeting Minutes (First Board Meeting)', category:'Corporate', url:'', notes:'' },
  { id:'si200_2024', name:'Statement of Information 2024', category:'Corporate', url:'', notes:'Filed 05/16/2024' },
  { id:'si200_2025', name:'Statement of Information 2025', category:'Corporate', url:'', notes:'Filed 03/05/2025, address updated' },
  { id:'si200_2025b', name:'Statement of Information Aug 2025', category:'Corporate', url:'', notes:'Filed 08/07/2025, new address: 2800 Walnut Ave' },
  // Licenses
  { id:'cslb_lic', name:'CSLB Contractor License #1123785', category:'Licenses', url:'', notes:'Construction, service' },
  { id:'epa608', name:'EPA 608 Universal Certification', category:'Licenses', url:'', notes:'Certificate: OiNXMYM1DG, SkillCat, June 30 2025' },
  // Insurance
  { id:'wc_cert', name:'Workers Compensation Certificate', category:'Insurance', url:'', notes:'Policy CWC03618700, Clear Spring, 10/03/2025-10/03/2026' },
  { id:'gl_cert', name:'Certificate of Liability Insurance', category:'Insurance', url:'', notes:'Pro-Builders Insurance, Mark Florea (916) 964-0717' },
  // Tax
  { id:'withholding', name:'CA Withholding Tax Requirements Letter', category:'Tax', url:'', notes:'FTB, Entity ID: 6117165/000, 03/12/2024' },
  // Other
  { id:'usps_1583', name:'USPS Form 1583', category:'Other', url:'', notes:'PMB opened 02/26/24, 3400 Cottage Way Ste G2 #23147' },
];

const FILE_CATEGORIES = ['All', 'Formation', 'Corporate', 'Licenses', 'Insurance', 'Tax', 'Payroll', 'Contracts', 'Other'];

const CAT_ICONS = {
  'Formation':'🏛', 'Corporate':'📋', 'Licenses':'🔨',
  'Insurance':'🛡', 'Tax':'📊', 'Payroll':'💰',
  'Contracts':'📜', 'Other':'📁'
};

const CAT_COLORS = {
  'Formation':'#1450a0', 'Corporate':'#b56e00', 'Licenses':'#166638',
  'Insurance':'#8b2fc9', 'Tax':'#b52a1c', 'Payroll':'#0d7c66',
  'Contracts':'#c44b00', 'Other':'#5a6370'
};

// Required documents checklist
const REQUIRED_DOCS = [
  { id:'articles',      label:'Articles of Incorporation',          category:'Formation' },
  { id:'bylaws',        label:'Corporate Bylaws',                   category:'Formation' },
  { id:'ein',           label:'EIN / Tax ID Letter',                category:'Formation' },
  { id:'form2553',      label:'IRS Form 2553 (S-Corp)',             category:'Formation' },
  { id:'statement_inc', label:'Statement of Incorporator',          category:'Formation' },
  { id:'biz_entity',    label:'Business Entity Filing',             category:'Formation' },
  { id:'banking_res',   label:'Banking Resolution',                 category:'Formation' },
  { id:'boir',          label:'BOIR Report',                        category:'Formation' },
  { id:'meeting_min',   label:'Meeting Minutes',                    category:'Corporate' },
  { id:'si200_2024',    label:'Statement of Information 2024',      category:'Corporate' },
  { id:'si200_2025',    label:'Statement of Information 2025',      category:'Corporate' },
  { id:'cslb_lic',      label:'CSLB License',                       category:'Licenses' },
  { id:'epa608',        label:'EPA 608 Certification',              category:'Licenses' },
  { id:'wc_cert',       label:'Workers Comp Certificate',           category:'Insurance' },
  { id:'gl_cert',       label:'General Liability Certificate',      category:'Insurance' },
  { id:'withholding',   label:'CA Withholding Letter',              category:'Tax' },
  { id:'usps_1583',     label:'USPS Form 1583',                     category:'Other' },
];

// ──────────────────────────────────────────────────────────────────

function loadGDrive() {
  try {
    const r = localStorage.getItem(GDRIVE_KEY);
    if (!r) return [...GDRIVE_DOCS]; // Return pre-populated list
    return JSON.parse(r);
  } catch { 
    return [...GDRIVE_DOCS]; 
  }
}

function saveGDrive(docs) {
  try { 
    localStorage.setItem(GDRIVE_KEY, JSON.stringify(docs)); 
  } catch(e) {
    showToast('⚠ Storage full');
  }
}

function convertGDriveLink(url) {
  if (!url) return '';
  
  // Handle various Google Drive URL formats:
  // https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // https://drive.google.com/open?id=FILE_ID
  // https://docs.google.com/document/d/FILE_ID/edit
  // https://docs.google.com/spreadsheets/d/FILE_ID/edit
  // https://docs.google.com/presentation/d/FILE_ID/edit
  
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  const openMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  const docsMatch = url.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
  const sheetsMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  const slidesMatch = url.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/);
  
  const id = (fileMatch || openMatch || docsMatch || sheetsMatch || slidesMatch)?.[1];
  
  if (id) {
    // Return preview URL
    return `https://drive.google.com/file/d/${id}/preview`;
  }
  
  return url; // return as-is if can't parse
}

function viewGDriveDoc(url) {
  if (!url) {
    alert('No Google Drive link added yet.\n\n1. Upload file to Google Drive\n2. Right-click → Share → Copy link\n3. Edit this document and paste the link');
    return;
  }
  window.open(url, '_blank');
}

function openAddDocModal() {
  const modal = document.getElementById('gdriveAddModal');
  if (!modal) {
    showToast('⚠ Modal not found');
    return;
  }
  
  document.getElementById('gdriveName').value = '';
  document.getElementById('gdriveCategory').value = 'Formation';
  document.getElementById('gdriveUrl').value = '';
  document.getElementById('gdriveNotes').value = '';
  
  modal.style.display = 'flex';
  modal.querySelector('input').focus();
}

function closeAddDocModal() {
  const modal = document.getElementById('gdriveAddModal');
  if (modal) modal.style.display = 'none';
}

function saveGDriveDoc() {
  const name = document.getElementById('gdriveName')?.value?.trim();
  const category = document.getElementById('gdriveCategory')?.value || 'Other';
  let url = document.getElementById('gdriveUrl')?.value?.trim() || '';
  const notes = document.getElementById('gdriveNotes')?.value?.trim() || '';
  
  if (!name) {
    showToast('⚠ Enter document name');
    return;
  }
  
  url = convertGDriveLink(url);
  
  const docs = loadGDrive();
  const id = Date.now() + Math.random();
  
  docs.push({
    id,
    name,
    category,
    url,
    notes,
    addedAt: new Date().toISOString()
  });
  
  saveGDrive(docs);
  showToast('✓ Document added');
  closeAddDocModal();
  renderGDriveVault();
}

function editGDriveDoc(id) {
  const docs = loadGDrive();
  const doc = docs.find(d => d.id === id);
  
  if (!doc) return;
  
  document.getElementById('gdriveName').value = doc.name;
  document.getElementById('gdriveCategory').value = doc.category;
  document.getElementById('gdriveUrl').value = doc.url;
  document.getElementById('gdriveNotes').value = doc.notes;
  document.getElementById('gdriveCurrentId').value = id;
  
  const modal = document.getElementById('gdriveAddModal');
  if (modal) {
    modal.style.display = 'flex';
    modal.querySelector('input').focus();
  }
}

function deleteGDriveDoc(id) {
  if (!confirm('Delete this document?')) return;
  
  const docs = loadGDrive().filter(d => d.id !== id);
  saveGDrive(docs);
  showToast('🗑 Deleted');
  renderGDriveVault();
}

function changeDriveCategory(id, newCat) {
  const docs = loadGDrive();
  const doc = docs.find(d => d.id === id);
  if (doc) { 
    doc.category = newCat; 
    saveGDrive(docs); 
    renderGDriveVault(); 
  }
}

function renderGDriveVault() {
  let docs = loadGDrive();
  const search = (document.getElementById('vaultSearch')?.value || '').toLowerCase();

  // Filter by category
  if (vaultFilter !== 'All') {
    docs = docs.filter(d => d.category === vaultFilter);
  }
  
  // Filter by search
  if (search) {
    docs = docs.filter(d => 
      d.name.toLowerCase().includes(search) || 
      d.notes.toLowerCase().includes(search)
    );
  }

  // Category filters
  const allDocs = loadGDrive();
  const cats = FILE_CATEGORIES.filter(c => c === 'All' || allDocs.some(d => d.category === c));
  document.getElementById('vaultFilters').innerHTML = cats.map(c =>
    `<button class="filter-btn ${vaultFilter === c ? 'active' : ''}" onclick="vaultFilter='${c}';renderGDriveVault()">${c}</button>`
  ).join('');

  // Document count
  const info = document.getElementById('storageInfo');
  if (info) {
    info.textContent = allDocs.length + ' document' + (allDocs.length !== 1 ? 's' : '');
  }

  // File list
  const list = document.getElementById('vaultFileList');
  if (!list) return;
  
  if (!docs.length) {
    list.innerHTML = '<div class="empty-vault">📂 No documents yet. Add your first document above.</div>';
    renderRequiredDocsList();
    return;
  }

  list.innerHTML = docs.map(doc => `
    <div class="file-item" style="border-left: 4px solid ${CAT_COLORS[doc.category] || '#999'}">
      <div class="file-header">
        <span class="file-cat-icon" style="color: ${CAT_COLORS[doc.category] || '#999'}">
          ${CAT_ICONS[doc.category] || '📄'}
        </span>
        <div class="file-info">
          <div class="file-name">${doc.name}</div>
          <div class="file-meta">
            ${doc.category} · ${new Date(doc.addedAt).toLocaleDateString()}
            ${doc.notes ? ` · ${doc.notes}` : ''}
          </div>
        </div>
      </div>
      <div class="file-actions">
        ${doc.url ? `<button class="btn btn-sm btn-primary" onclick="viewGDriveDoc('${doc.url}')" title="View">👁 View</button>` : ''}
        <button class="btn btn-sm" onclick="editGDriveDoc(${doc.id})" title="Edit">✏ Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteGDriveDoc(${doc.id})" title="Delete">✕</button>
      </div>
    </div>
  `).join('');

  renderRequiredDocsList();
}

function renderRequiredDocsList() {
  const docs = loadGDrive();
  const list = document.getElementById('vaultRequiredList');
  if (!list) return;

  const linked = new Set(docs.map(d => REQUIRED_DOCS.find(r => r.id === d.id)?.id).filter(Boolean));

  list.innerHTML = `
    <div style="padding: 16px; border-bottom: 1px solid var(--border);">
      <div style="font-size: 13px; color: var(--muted); margin-bottom: 12px; font-weight: 600;">
        📋 REQUIRED DOCUMENTS — ${linked.size}/${REQUIRED_DOCS.length}
      </div>
      <div style="display: grid; gap: 8px;">
        ${REQUIRED_DOCS.map(req => {
          const hasDoc = linked.has(req.id);
          return `
            <div style="display: flex; align-items: center; gap: 8px; padding: 8px; background: ${hasDoc ? 'rgba(22, 102, 56, 0.1)' : 'rgba(181, 42, 28, 0.05)'}; border-radius: 6px; font-size: 12px;">
              <span style="font-size: 16px;">${hasDoc ? '✓' : '✗'}</span>
              <span>${req.label}</span>
              ${!hasDoc ? `<button class="btn btn-sm btn-primary" onclick="openAddDocModal()" style="margin-left: auto;">+</button>` : ''}
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────────────────────────────
