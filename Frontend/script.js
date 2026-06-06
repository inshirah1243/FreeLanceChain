// ===== BLOCKCHAIN SETUP =====
let provider;
let signer;
let contract;
let currentAccount;

const contractAddress = "0x1fEc805A9FEA0eE5eE63762Dcc3B18264A169D44";

const contractABI = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_jobId",
				"type": "uint256"
			}
		],
		"name": "approveWork",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_jobId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "_freelancer",
				"type": "address"
			}
		],
		"name": "assignFreelancer",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_ipfsHash",
				"type": "string"
			}
		],
		"name": "createJob",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "jobId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "freelancer",
				"type": "address"
			}
		],
		"name": "FreelancerAssigned",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "jobId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "client",
				"type": "address"
			}
		],
		"name": "JobCreated",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_jobId",
				"type": "uint256"
			}
		],
		"name": "lockPayment",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "jobId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "PaymentLocked",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "jobId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "freelancer",
				"type": "address"
			}
		],
		"name": "PaymentReleased",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "jobCounter",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "jobs",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "jobId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "client",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "freelancer",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "paymentAmount",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "ipfsHash",
				"type": "string"
			},
			{
				"internalType": "enum JobEscrow.JobStatus",
				"name": "status",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]

window.onload = async function () {
    let savedAccount = localStorage.getItem("currentAccount");

    if (savedAccount) {
        currentAccount = savedAccount;
    }
};

window.connectWallet = async function () {
        if (!window.ethereum) {
        alert("MetaMask not detected.");
        return;
    }

    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();

    const network = await provider.getNetwork();
    if (network.chainId !== 11155111) {
        alert("Switch to Sepolia network.");
        return;
    }
    currentAccount = await signer.getAddress();

    contract = new ethers.Contract(contractAddress, contractABI, signer);

    console.log("✅ Wallet connected to Sepolia");
    console.log("✅ Contract connected");
}

function escapeHtml(text) {
    return text;
}

/* ===== NAVIGATION ===== */
function showClient(id, event) {
    document.querySelectorAll(".section").forEach(d => d.classList.add("hidden"));
    document.getElementById(id).classList.remove("hidden");
    document.querySelectorAll(".sidebar-item").forEach(d => d.classList.remove("active"));
    //event.target.classList.add("active");
    if(event) event.target.classList.add("active");
    if(id === 'proposals') displayProposals();
    if(id === 'manage') displayClientJobs();
    if(id === 'reviewSubmissionsSection') showReviewSubmissions();
    if(id === 'stats') displayClientStats();
    if(id === 'timeline') displayTimeline();
}

function showFreelancer(id) {
    document.querySelectorAll(".section").forEach(d => d.classList.add("hidden"));
    document.getElementById(id).classList.remove("hidden");
    document.querySelectorAll(".sidebar-item").forEach(d => d.classList.remove("active"));
    event.target.classList.add("active");
    
    if(id === 'browse') displayFreelancerJobs();
    if(id === 'proposals') displayMyApplications();
    if(id === 'work') displayActiveWork();
    if(id === 'completed') displayCompletedWork();
    if(id === 'stats') displayFreelancerStats();
}

/* ===== STORAGE ===== */
function getJobs(){
    let data = localStorage.getItem("jobs");
    console.log("📦 Raw localStorage 'jobs':", data);
    let jobs = JSON.parse(data) || [];
    console.log("📋 Parsed jobs:", jobs);
    jobs.sort((a, b) => b.id - a.id);
    return jobs;
}

function saveJobs(jobs){
    console.log("💾 Saving jobs to localStorage:", jobs);
    localStorage.setItem("jobs", JSON.stringify(jobs));
    let verify = JSON.parse(localStorage.getItem("jobs"));
    console.log("✅ Verified saved data:", verify);
}

function getIgnoredJobs(){
    let freelancer = localStorage.getItem("currentFreelancer");
    if(!freelancer) return [];
    let ignored = JSON.parse(localStorage.getItem("ignoredJobs_" + freelancer)) || [];
    return ignored;
}

function saveIgnoredJobs(ignoredJobIds){
    let freelancer = localStorage.getItem("currentFreelancer");
    if(!freelancer) return;
    localStorage.setItem("ignoredJobs_" + freelancer, JSON.stringify(ignoredJobIds));
}

function ignoreJob(jobId){
    let freelancer = localStorage.getItem("currentFreelancer");
    if(!freelancer) {
        alert("Please login first");
        return;
    }
    
    let ignored = getIgnoredJobs();
    if(!ignored.includes(jobId)) {
        ignored.push(jobId);
        saveIgnoredJobs(ignored);
    }
    
    alert("❌ Job ignored. It won't appear in your Browse Jobs anymore.");
    displayFreelancerJobs();
}

/* ===== VALIDATION ===== */
function validateAndPostJob() {
    let title = document.getElementById("title").value.trim();
    let desc = document.getElementById("desc").value.trim();
    let budget = document.getElementById("budget").value.trim();
    let category = document.getElementById("category").value;
    let timeline = document.getElementById("timeline").value;
    
    if(!title) {
        alert("Job title is required");
        document.getElementById("title").focus();
        return;
    }
    
    if(title.length < 5) {
        alert("Job title must be at least 5 characters");
        return;
    }
    
    if(!desc) {
        alert("Job description is required");
        document.getElementById("desc").focus();
        return;
    }
    
    if(desc.length < 20) {
        alert("Description must be at least 20 characters");
        return;
    }
    
    if(!budget || budget < 0.0001) {
        alert("Budget must be at least 0.0001ETH");
        document.getElementById("budget").focus();
        return;
    }
    
    /*if(budget > 10000) {
        alert("Budget cannot exceed $10,000");
        return;
    } */
    
    if(!category) {
        alert("Please select a category");
        return;
    }
    
    postJob();
}

/* ===== CLIENT FUNCTIONS ===== */
async function postJob() {
    if (!contract) {
        alert("Contract not connected");
        return;
    }

    try {
        const title = document.getElementById("title").value.trim();
        const desc = document.getElementById("desc").value.trim();
        const budget = document.getElementById("budget").value.trim();
       // const timeline = document.getElementById("timeline").value;
        let timeline = document.getElementById("timeline").value;
        let customTimeline = document.getElementById("customTimeline").value;
        if (timeline === "custom" && customTimeline) {
            timeline = Number(customTimeline);
        }
        //const category = document.getElementById("category").value;
        let category = document.getElementById("category").value;
        let customCategory = document.getElementById("customCategory").value.trim();

        if (category === "other" && customCategory) {
            category = customCategory;
        }
        if (!title || !desc) {
            alert("Please fill required fields");
            return;
        }

        const jobData = JSON.stringify({ title, desc });

        const tx = await contract.createJob(jobData);

        alert("Transaction sent...");
        await tx.wait();
        alert("✅ Job created on blockchain successfully!");

        const jobId = await contract.jobCounter();

        let jobs = getJobs();

        jobs.push({
            id: Number(jobId),
            title: title,
            desc: desc,
            budget: Number(budget),
            timeline: timeline,   // ← ADD THIS LINE
            proposals: [],
            selected: null,
            category: category,
            escrow: false,        // ← ADD THIS (helps escrow logic)
            status: "Open",
           // createdAt: new Date().toLocaleString()
            createdAt: Date.now()
        });

        saveJobs(jobs);

    } catch (error) {
        console.error(error);
        alert("Transaction failed");
    }
}

async function assignFreelancer() {
    if (!contract) {
        alert("Contract not connected");
        return;
    }

    try {
        const jobId = Number(document.getElementById("assignJobId").value);
        const freelancerAddress = document.getElementById("freelancerAddress").value;
        console.log("Job ID:", jobId);

        if (!jobId || !freelancerAddress) {
            alert("Enter job ID and freelancer address");
            return;
        }

        const tx = await contract.assignFreelancer(jobId, freelancerAddress);

        alert("Transaction sent...");
        await tx.wait();

        alert("✅ Freelancer assigned successfully!");

    } catch (error) {
        console.error(error);
        alert("Assignment failed");
    }
}
/*
function requestRevision(jobId){

    let jobs = getJobs();
    let job = jobs.find(j => j.id == jobId);

    if(job){

        job.status = "Revision Requested";

        // Optional: store message
        let msg = prompt("Enter revision message (optional):");

        if(msg){
            job.revisionMessage = msg;
        }

    }
    if(job.status === "Revision Requested"){
        badge = "🟠 Needs Revision";
    }

    saveJobs(jobs);

    alert("🔁 Revision requested from freelancer");

    showReviewSubmissions(); // refresh UI
} */

function requestRevision(jobId){
    let jobs = getJobs();
    let job = jobs.find(j => j.id == jobId);

    if(job){
        job.status = "Revision Requested";

        let msg = prompt("Enter revision message:");
        if(msg){
            job.revisionMessage = msg;
        }
    }

    saveJobs(jobs);

    alert("🔁 Revision requested from freelancer");
}

function getRemainingDays(job) {
    let createdAt = job.createdAt;
    if (typeof createdAt !== 'number') {
        createdAt = new Date(createdAt).getTime();
    }
    const daysPassed = Math.floor((Date.now() - createdAt) / (1000 * 60 * 60 * 24));
    let daysLeft = job.timeline - daysPassed;
    if (daysLeft < 0) daysLeft = 0;
    return `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`;
}

function displayClientJobs() {
    let jobs = getJobs();
    let div = document.getElementById("clientJobs");
    let emptyMsg = document.getElementById("emptyMsg");
    if(!div) return;
    div.innerHTML = "";
    
    if(jobs.length === 0) {
        emptyMsg.style.display = "block";
        return;
    }
    
    emptyMsg.style.display = "none";
    
    jobs.forEach(job => {
        let statusClass = job.status === "Payment Released" ? "status-completed" : 
                         job.status === "Work Submitted" ? "status-review" :
                         job.status === "Escrow Locked" ? "status-active" : "status-open";
        
        let html = `<div class="job-card ${statusClass}">
            <div class="job-header">
                <h4>${escapeHtml(job.title)}</h4>
                <span class="status-badge">${job.status}</span>
            </div>
            <p class="job-desc">${escapeHtml(job.desc)}</p>
            <div class="job-meta">
                <span>📂 ${job.category}</span>
                <span>⏱️ ${getRemainingDays(job)}</span>
                <span>👥 ${job.proposals.length} proposal${job.proposals.length !== 1 ? 's' : ''}</span>
            </div>
            <p class="job-budget">💰 $${job.budget}</p>`;
        
        // Show proposals only if job is Open
        if(job.status === "Open" || job.status === "Assigned"){
            html += `<div class="proposals-section">
                <p><strong>Proposals (${job.proposals.length}):</strong></p>`;
            job.proposals.forEach((p, i) => {
                html += `<div class="proposal-item">
                    <span>${p.freelancer}</span>
                    <button onclick="selectFreelancer(${job.id}, ${i})" class="secondary" style="padding:6px 12px; font-size:12px;">Select</button>
                </div>`;
            });
            html += `</div>`;
        }
        
        // Show selected freelancer
        if(job.selected) {
            let selectedProposal = job.proposals.find(p => p.wallet === job.selected);
            let displayName = selectedProposal ? selectedProposal.freelancer : "Unknown";
            html += `<p class="selected-info">✅ Selected: <strong>${displayName}</strong></p>`;
        }
        
        // Lock Payment button
        if(job.status === "Selected") {
            html += `<button onclick="lockPayment(${job.id}, ${job.budget})" class="primary" style="width:100%; margin-top:10px; font-size:13px;">🔒 Lock Payment (Escrow)</button>`;        
        }
    
        // Release Payment button
        if(job.status === "Work Submitted") {
            html += `<div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-top:10px;">
                <button onclick="releasePayment(${job.id})" class="primary" style="font-size:13px;">💳 Approve & Release</button>
                <button onclick="requestRevision(${job.id})" class="btn-warning">
                    🔁 Request Revision
                </button>
                <button onclick="rejectWork(${job.id})" class="secondary" style="font-size:13px;">❌ Reject</button>
            </div>`;
        }
        
        html += `<button onclick="viewJobDetailsClient(${job.id})" class="secondary" style="width:100%; margin-top:10px; font-size:13px;">View Details</button>`;
        html += `<button onclick="deleteJob(${job.id})" class="secondary" style="width:100%; margin-top:8px; font-size:13px; background-color:#ef4444; color:white; border-color:#dc2626;">
            🗑️ Delete Job</button>`;
        // Delete button - only for Open jobs without proposals
        //if(job.status === "Open" && job.proposals.length === 0) {
        //    html += `<button onclick="deleteJob(${job.id})" class="secondary" style="width:100%; margin-top:8px; font-size:13px; background-color:#ef4444; color:white; border-color:#dc2626;">🗑️ Delete Job</button>`;
        //}
        
        html += `</div>`;
        div.innerHTML += html;
    });
}

// showReviewSubmissions populates the Review Submissions section for clients
function showReviewSubmissions() {
    let jobs = getJobs().filter(j => j.status === "Work Submitted");
    let container = document.getElementById("reviewSubmissionsList");
    let empty = document.getElementById("emptySubmissions");
    if(!container) return;
    container.innerHTML = "";
    if(jobs.length === 0) {
        if(empty) empty.style.display = "block";
        return;
    }
    if(empty) empty.style.display = "none";
    jobs.forEach(job => {
        // extract description/link supporting both old and new property names
        let workDesc = job.workSubmitted ? (job.workSubmitted.description || job.workSubmitted.details || "") : "";
        //let workLink = job.workSubmitted ? (job.workSubmitted.link || job.workSubmitted.attachment || "#") : "#";
        let workLink = job.workSubmitted ? (job.workSubmitted.link || job.workSubmitted.attachment || "#") : "#";
        //FIX: ensure proper URL
        if (workLink && !workLink.startsWith("http")) {
            workLink = "https://" + workLink;
        }
        let html = `<div class="job-card status-review">
            <div class="job-header">
                <h4>${escapeHtml(job.title)}</h4>
                <span class="status-badge">${job.status}</span>
            </div>
            <p class="job-desc">${escapeHtml(job.desc)}</p>
            <p class="job-meta">👤 <strong>Freelancer:</strong> ${escapeHtml(job.selected || '')}</p>
            <p class="job-meta">📝 ${escapeHtml(workDesc)}</p>
            <p class="job-meta">🔗 <a href="${escapeHtml(workLink)}" target="_blank">View Submission</a></p>
            
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-top:10px;">
                <button onclick="releasePayment(${job.id})" class="primary">💳 Approve</button>
                <button onclick="requestRevision(${job.id})" class="btn-warning">🔁 Request Revision</button>
            </div>
        </div>`;
        container.innerHTML += html;
    });
}

function filterJobs() {
    let searchTerm = document.getElementById("searchJobs").value.toLowerCase();
    let statusFilter = document.getElementById("statusFilter").value;
    let jobs = getJobs();
    let div = document.getElementById("clientJobs");
    
    let filtered = jobs.filter(job => {
        let matchesSearch = job.title.toLowerCase().includes(searchTerm) || 
                           job.desc.toLowerCase().includes(searchTerm);
        let matchesStatus = !statusFilter || job.status === statusFilter;
        return matchesSearch && matchesStatus;
    });
    
    div.innerHTML = "";
    
    if(filtered.length === 0) {
        div.innerHTML = '<div class="empty-msg">No matching jobs found</div>';
        return;
    }
    
    filtered.forEach(job => {
        let statusClass = job.status === "Payment Released" ? "status-completed" : 
                         job.status === "Work Submitted" ? "status-review" :
                         job.status === "Escrow Locked" ? "status-active" : "status-open";
        
        let html = `<div class="job-card ${statusClass}">
            <div class="job-header">
                <h4>${escapeHtml(job.title)}</h4>
                <span class="status-badge">${job.status}</span>
            </div>
            <p class="job-desc">${escapeHtml(job.desc)}</p>
            <div class="job-meta">
                <span>📂 ${job.category}</span>
                <span>⏱️ ${getRemainingDays(job)}</span>
            </div>
            <p class="job-budget">💰 $${job.budget}</p>`;
        
        if(job.selected) {
            html += `<p class="selected-info">✅ Selected: <strong>${job.selected}</strong></p>`;
        }
        
        html += `<button onclick="viewJobDetailsClient(${job.id})" class="secondary" style="width:100%; margin-top:10px; font-size:13px;">View Details</button>`;
        html += `<button onclick="deleteJob(${job.id})" 
            class="secondary" 
            style="width:100%; margin-top:8px; font-size:13px; background-color:#ef4444; color:white; border-color:#dc2626;">
            🗑️ Delete Job
            </button>`;
        html += `</div>`;
        div.innerHTML += html;
    });
}

async function selectFreelancer(jobId, proposalIndex) {

    if (!contract) {
        alert("Contract not connected");
        return;
    }

    try {

        let jobs = getJobs();
        let job = jobs.find(j => j.id == jobId);

        if (!job) {
            alert("Job not found");
            return;
        }

        let proposal = job.proposals[proposalIndex];

        if (!proposal || !proposal.wallet) {
            alert("Freelancer wallet not found");
            console.error("Proposal data:", proposal);
            return;
        }

        const freelancerAddress = proposal.wallet;

        const tx = await contract.assignFreelancer(jobId, freelancerAddress);

        alert("Assigning freelancer on blockchain...");
        await tx.wait();

        // Update frontend data
        job.selected = freelancerAddress;
        job.status = "Assigned";

        saveJobs(jobs);
        displayProposals();

        alert("✅ Freelancer assigned successfully!");

    } catch (error) {

        console.error(error);
        alert("Assignment failed");

    }
}

async function lockPayment(jobId, amount) {

    if (!contract) {
        alert("Connect wallet first");
        return;
    }

    try {

        const tx = await contract.lockPayment(
            jobId,
            {
                value: ethers.utils.parseEther(String(amount))
            }
        );

        alert("Locking payment... confirm in MetaMask");

        await tx.wait();
        // 🔹 UPDATE FRONTEND STATE
        let jobs = getJobs();
        let job = jobs.find(j => j.id == jobId);

        if(job){
            job.status = "Escrow Locked";
            job.escrow = true;
        }
        saveJobs(jobs);

        displayClientJobs();

        alert("✅ Payment locked in escrow!");

    } catch (error) {
        console.error(error);
        alert("Escrow payment failed");

    }

}

/*function releasePayment(jobId) {
    let jobs = getJobs();
    let job = jobs.find(j => j.id == jobId);
    
    if(!job) return;
    
    job.status = "Payment Released";
    job.completedAt = new Date().toLocaleString();
    
    saveJobs(jobs);
    displayClientJobs();
    alert("💳 Payment released successfully! Job is complete.");
} */
async function releasePayment(jobId) {

    if (!contract) {
        alert("Connect wallet first");
        return;
    }

    try {

        const tx = await contract.approveWork(jobId);

        alert("Confirm payment release in MetaMask...");

        await tx.wait();

        let jobs = getJobs();
        let job = jobs.find(j => j.id == jobId);
        if(job){
            job.status = "Payment Released";
            job.paymentNotified = false;
            let rating = prompt("⭐ Rate the freelancer (1–5):\n1 = Poor\n5 = Excellent");

            if(rating){
                rating = Number(rating);
                if(rating >= 1 && rating <= 5){
                    job.rating = rating;
                } else {
                    alert("Invalid rating. Must be between 1 and 5.");
                }
            }
        }

        saveJobs(jobs);
        displayClientJobs();
        alert("💳 Payment released to freelancer!");

    } catch (error) {

        console.error(error);
        alert("Payment release failed");

    }
}

function rejectWork(jobId) {
    if(confirm("⚠️ Are you sure? This will reject the work and return funds to escrow. You can ask the freelancer for revisions.")) {
        let jobs = getJobs();
        let job = jobs.find(j => j.id == jobId);
        job.status = "Escrow Locked";
        job.workSubmitted = null;
        saveJobs(jobs);
        displayClientJobs();
        alert("❌ Work rejected. Payment returned to escrow.");
    }
}

function deleteJob(jobId) {
    if(confirm("🗑️ Are you sure? This job will be permanently deleted. This action cannot be undone.")) {
        let jobs = getJobs();
        let jobIndex = jobs.findIndex(j => j.id == jobId);
        
        if(jobIndex === -1) return;
        
        let jobTitle = jobs[jobIndex].title;
        jobs.splice(jobIndex, 1);
        saveJobs(jobs);
        displayClientJobs();
        updateJobCount();
        alert(`✅ Job "${jobTitle}" has been deleted successfully.`);
    }
}

function checkFreelancerPayments(){
    let freelancer = localStorage.getItem("currentFreelancer");
    let jobs = getJobs();
    jobs.forEach(job => {
        if(
            job.status === "Payment Released" &&
            job.workSubmitted &&
            job.workSubmitted.freelancer === currentAccount  &&
            !job.paymentNotified
        ){
            alert("💰 Payment received for job: " + job.title);
            job.paymentNotified = true;
        }
    });
    saveJobs(jobs);
}

function displayProposals() {
    let jobs = getJobs();
    let container = document.getElementById("proposalsContainer");
    let emptyMsg = document.getElementById("emptyProposals");
    
    if(!container) return;
    
    container.innerHTML = "";
    
    // Collect all proposals with job info
    let allProposals = [];
    jobs.forEach(job => {
        console.log("Job:", job.title, "Proposals:", job.proposals);
        if(job.proposals && job.proposals.length > 0) {
            job.proposals.forEach((proposal, index) => {
                if(job.selected && proposal.wallet !== job.selected){
                    return; //  hide all non-selected proposals
                }
                allProposals.push({
                    jobId: job.id,
                    jobTitle: job.title,
                    jobDesc: job.desc,
                    jobBudget: job.budget,
                    category: job.category,
                    freelancer: proposal.freelancer,
                    wallet: proposal.wallet, 
                    appliedAt: proposal.appliedAt || "Recently",
                    proposalIndex: index,
                    jobStatus: job.status
                });
            });
        }
    });
    
    console.log("Total proposals found:", allProposals.length);
    
    if(allProposals.length === 0) {
        emptyMsg.classList.remove("hidden");
        container.classList.add("hidden");
        console.log("No proposals - showing empty message");
        return;
    }
    
    emptyMsg.classList.add("hidden");
    container.classList.remove("hidden");
    
    // Display all proposals
    allProposals.forEach((proposal, i) => {
        let statusBgColor = proposal.jobStatus === "Open" ? "#667eea" : "#f59e0b";
        let statusText;
        if (proposal.jobStatus === "Open") {
            statusText = "Open for Proposals";
        } 
        else if (proposal.jobStatus === "Assigned") {
            statusText = "Freelancer Selected";
        } 
        else {
            statusText = "Closed";
        }        
        let html = `<div class="proposal-card">
            <div class="proposal-header">
                <div style="flex:1;">
                    <h4 style="margin:0 0 5px 0;">${escapeHtml(proposal.jobTitle)}</h4>
                    <p style="font-size:12px; color:#666; margin:0;">${escapeHtml(proposal.jobDesc.substring(0, 70))}...</p>
                </div>
                <span class="badge" style="background-color: ${statusBgColor}; color:white; flex-shrink:0;">${proposal.category}</span>
            </div>
            <div class="proposal-body">
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-bottom:12px;">
                    <div>
                        <p style="font-size:11px; color:#999; text-transform:uppercase; margin:0 0 4px 0;">Freelancer</p>
                        <p style="font-weight:600; font-size:14px; margin:0;">${escapeHtml(proposal.freelancer)}</p>
                    </div>
                    <div>
                        <p style="font-size:11px; color:#999; text-transform:uppercase; margin:0 0 4px 0;">Budget</p>
                        <p style="font-weight:600; font-size:14px; color:#667eea; margin:0;">${proposal.jobBudget} ETH</p>
                    </div>
                </div>
                <p style="font-size:12px; color:#666; margin:8px 0;"><strong>Applied:</strong> ${proposal.appliedAt}</p>
                <p style="font-size:12px; color:#666; margin:0;"><strong>Status:</strong> <span style="color:${statusBgColor}; font-weight:600;">${statusText}</span></p>
            </div>
            <div class="proposal-actions">
                ${proposal.jobStatus === "Open" ? `
                    <button onclick="selectFreelancer(${proposal.jobId}, ${proposal.proposalIndex})">
                        ✅ Accept
                    </button>
                    <button onclick="rejectProposal(${proposal.jobId}, ${proposal.proposalIndex})">
                        ❌ Reject
                    </button>
                ` : proposal.jobStatus === "Assigned" ? `
                    <button onclick="lockPayment(${proposal.jobId}, ${proposal.jobBudget})">
                        💰 Lock Payment
                    </button>
                ` : `
                    <span>Job Closed</span>
                `}
            </div>
        </div>`;
        container.innerHTML += html;
    });
}

function rejectProposal(jobId, proposalIndex) {
    if(confirm("❌ Are you sure you want to reject this proposal?")) {
        let jobs = getJobs();
        let job = jobs.find(j => j.id == jobId);
        if(job && job.proposals[proposalIndex]) {
            let freelancerName = job.proposals[proposalIndex].freelancer;
            job.proposals.splice(proposalIndex, 1);
            saveJobs(jobs);
            displayProposals();
            alert(`Proposal from ${freelancerName} has been rejected.`);
        }
    }
}

/*let jobs = getJobs();
function displayClientStats() {
    let total = jobs.length;
    let inProgress = jobs.filter(j => j.status !== "Open" && j.status !== "Payment Released").length;
    let completed = jobs.filter(j => j.status === "Payment Released").length;
    let totalBudget = jobs.reduce((sum, j) => sum + (j.budget || 0), 0);
    let activeProposals = jobs.reduce((sum, j) => sum + j.proposals.length, 0);
    let escrowLocked = jobs
        .filter(j => j.status === "Escrow Locked" || j.status === "Work Submitted")
        .reduce((sum, j) => sum + (j.budget || 0), 0);
    
    document.getElementById("totalJobs").textContent = total;
    document.getElementById("selectedJobs").textContent = inProgress;
    document.getElementById("completedJobs").textContent = completed;
    document.getElementById("totalBudget").textContent = "$" + totalBudget;
    document.getElementById("activeProposals").textContent = activeProposals;
    document.getElementById("escrowLocked").textContent = "$" + escrowLocked;
    
    // Breakdown chart
    let openCount = jobs.filter(j => j.status === "Open").length;
    let progressCount = inProgress;
    
    let totalCount = total || 1;
    document.getElementById("breakOpen").style.width = (openCount / totalCount * 100) + "%";
    document.getElementById("breakProgress").style.width = (progressCount / totalCount * 100) + "%";
    document.getElementById("breakComplete").style.width = (completed / totalCount * 100) + "%";
    
    document.getElementById("breakOpenCount").textContent = openCount;
    document.getElementById("breakProgressCount").textContent = progressCount;
    document.getElementById("breakCompleteCount").textContent = completed;
} */
function displayClientStats(){

    let jobs = getJobs();

    let totalJobs = jobs.length;
    let inProgress = 0;
    let completed = 0;
    let totalSpent = 0;
    let escrow = 0;
    let proposals = 0;
    let open = 0;
    //let progress = 0;
    //let complete = 0;

    jobs.forEach(job => {
        if(job.proposals){
            proposals += job.proposals.length;
        }
        if (job.status === "Open"){
            open++;
        }

        if(job.status === "Assigned" || job.status === "Escrow Locked" || job.status==="Work Submitted" || job.status === "Revision Requested"){
            inProgress++;
        }

        if(job.status === "Payment Released"){
            completed++;
            totalSpent += Number(job.budget);
        }

        if(job.status === "Escrow Locked"){
            escrow += Number(job.budget);
        }
    });
//    let tot=job.length || 1;

    document.getElementById("totalJobs").innerText = totalJobs;
    document.getElementById("selectedJobs").innerText = inProgress;
    document.getElementById("completedJobs").innerText = completed;
    document.getElementById("totalBudget").innerText = totalSpent.toFixed(4) + " ETH";
    //document.getElementById("totalBudget").innerText = totalSpent + " ETH";
    document.getElementById("activeProposals").innerText = proposals;
    document.getElementById("escrowLocked").innerText = escrow + " ETH";
    //Graph
    document.getElementById("breakOpenCount").innerText = open;
    document.getElementById("breakProgressCount").innerText = inProgress;
    document.getElementById("breakCompleteCount").innerText = completed;
    document.getElementById("breakOpen").style.width = (open/totalJobs*100) + "%";
    document.getElementById("breakProgress").style.width = (inProgress/total*100) + "%";
    document.getElementById("breakComplete").style.width = (completed/total*100) + "%";
    }

function displayTimeline() {
    //console.log("Timeline container:", document.getElementById("timelineContent"));
    console.log("Timeline function running");
    let jobs = getJobs();
    let container = document.getElementById("timelineContent");
    let emptyTimeline = document.getElementById("emptyTimeline");
    if(!container) return;
    container.innerHTML = "";
    if(jobs.length === 0) {
        emptyTimeline.style.display = "block";
        return;
    }
    
    emptyTimeline.style.display = "none";
    
    // Sort by creation date
    jobs.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    jobs.forEach(job => {
        let isCompleted = job.status === "Payment Released";
        let html = `<div class="timeline-item ${isCompleted ? 'completed' : ''}">
            <div class="timeline-content">
                <div class="timeline-title">${job.title}</div>
                <div class="timeline-desc">Posted: ${job.createdAt}</div>
                <div class="timeline-desc" style="margin-top:8px;">
                    Status: <strong>${job.status}</strong> | Budget: <strong>${job.budget} ETH</strong>
                </div>
                ${job.selected ? `<div class="timeline-desc" style="margin-top:8px; color:#667eea;">Freelancer: <strong>${job.selected}</strong></div>` : ''}
            </div>
        </div>`;
        container.insertAdjacentHTML("beforeend", html);
    });
}

function viewJobDetailsClient(jobId) {
    let jobs = getJobs();
    let job = jobs.find(j => j.id == jobId);
    if(!job) return;
    
    document.getElementById("modalTitle").textContent = job.title;
    document.getElementById("modalDesc").textContent = job.desc;
    document.getElementById("modalBudget").textContent = job.budget;
    document.getElementById("modalStatus").textContent = job.status;
    document.getElementById("modalCategory").textContent = job.category;
    document.getElementById("modalTimeline").textContent = job.timeline + " days";
    
    // Skills section
    let skillsSection = document.getElementById("skillsSection");
    if(job.skills && job.skills.length > 0) {
        skillsSection.style.display = "block";
        let skillsHtml = job.skills.map(s => `<span class="skill-tag">${escapeHtml(s)}</span>`).join('');
        document.getElementById("modalSkills").innerHTML = skillsHtml;
    } else {
        skillsSection.style.display = "none";
    }
    
    // Proposals section
    let proposalsSection = document.getElementById("proposalsSection");
    if(job.status === "Open" && job.proposals.length > 0) {
        proposalsSection.style.display = "block";
        let proposalsHtml = job.proposals.map(p => `<div class="proposal-item-modal"><span>${p.freelancer}</span></div>`).join('');
        document.getElementById("modalProposals").innerHTML = proposalsHtml;
    } else {
        proposalsSection.style.display = "none";
    }
    
    document.getElementById("jobDetailsModal").classList.remove("hidden");
}

function closeJobModal() {
    document.getElementById("jobDetailsModal").classList.add("hidden");
}

/* ===== FREELANCER FUNCTIONS ===== */
function applyJob(jobId) {
    let freelancer = localStorage.getItem("currentFreelancer");
    if(!freelancer) {
        alert("Please login first");
        return;
    }
    if(!currentAccount){
        alert("Connect wallet first");
        return;
    }
    let jobs = getJobs();
    let job = jobs.find(j => j.id == jobId);
    
    if(!job) {
        alert("Job not found!");
        return;
    }
    
    // Check if already applied
    if(job.proposals && job.proposals.some(p => p.freelancer === currentAccount)) {
        alert("⚠️ You have already applied for this job");
        return;
    }
    
    // Ensure proposals array exists
    if(!job.proposals) {
        job.proposals = [];
    }
    
    
    job.proposals.push({
        freelancer: freelancer,
        wallet: currentAccount,
        status: "pending",
        appliedAt: new Date().toLocaleString()
    });
    
    saveJobs(jobs);
    console.log("✅ Applied to job:", jobId, "Total proposals now:", job.proposals.length);
    alert("✅ Application submitted! Good luck!");
    location.reload();
}

function applyJobFromModal() {
    let jobId = document.getElementById("applyBtn").dataset.jobId;
    applyJob(jobId);
    closeModal();
    displayFreelancerJobs();
}

function submitWorkFromModal() {
    document.getElementById("jobModal").classList.add("hidden");
    let jobId = document.getElementById("submitBtn").dataset.jobId;
    document.getElementById("submitBtn").dataset.activeJobId = jobId;
    document.getElementById("submitWorkModal").classList.remove("hidden");
}

function confirmWorkSubmission() {
    let jobId = document.getElementById("submitBtn").dataset.activeJobId;
    let workDetails = document.getElementById("workInput").value.trim();
    let attachment = document.getElementById("attachmentInput").value.trim();
    
    if(!workDetails) {
        alert("Please describe your work");
        return;
    }
    
    let freelancer = localStorage.getItem("currentFreelancer");
    let jobs = getJobs();
    let job = jobs.find(j => j.id == jobId);
    
    if(!job || job.selected !== currentAccount) {
        alert("You are not assigned to this job");
        return;
    }
    
    job.workSubmitted = {
        freelancer: freelancer,
        wallet: currentAccount, 
        details: workDetails,
        attachment: attachment,
        submittedAt: new Date().toLocaleString()
    };
    job.status = "Work Submitted";
    saveJobs(jobs);
    
    closeSubmitModal();
    displayActiveWork();
    displayClientJobs();   // ← ADD THIS
    alert("⬆️ Work submitted! Client will review it soon.");
}

function displayFreelancerJobs() {
    let freelancer = localStorage.getItem("currentFreelancer");
    let jobs = getJobs();
    let div = document.getElementById("jobList");
    let emptyMsg = document.getElementById("emptyJobs");
    
    if(!div) return;
    
    div.innerHTML = "";
    
    // Get ignored jobs for this freelancer
    let ignored = getIgnoredJobs();
    
    // Only show Open jobs that are not ignored
    let openJobs = jobs.filter(j => j.status === "Open" && !ignored.includes(j.id));
    
    if(openJobs.length === 0) {
        emptyMsg.style.display = "block";
        return;
    }
    
    emptyMsg.style.display = "none";
    
    openJobs.forEach(job => {
        let applied = job.proposals.some(p => p.freelancer === freelancer);
        
        let html = `<div class="job-card">
            <div class="job-header">
                <h4>${escapeHtml(job.title)}</h4>
                <span class="status-badge">Open</span>
            </div>
            <p class="job-desc">${escapeHtml(job.desc)}</p>
            <div class="job-meta">
                <span>📂 ${job.category}</span>
                <span>⏱️ ${getRemainingDays(job)}</span>
                <span>👥 ${job.proposals.length} proposals</span>
            </div>
            <p class="job-budget">💰 $${job.budget}</p>
            <button onclick="applyJob(${job.id})" class="primary" style="width:100%; margin-top:10px; font-size:13px;" ${applied ? "disabled" : ""}>
                ${applied ? "✅ Already Applied" : "📨 Apply for Job"}
            </button>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-top:8px;">
                <button onclick="viewJobDetailsFreelancer(${job.id})" class="secondary" style="font-size:13px;">View Details</button>
                <button onclick="ignoreJob(${job.id})" class="secondary" style="font-size:13px; background-color:#f87171; color:white; border-color:#dc2626;">❌ Ignore Job</button>
            </div>
        </div>`;
        
        div.innerHTML += html;
    });
}

function handleTimelineChange() {
    let timeline = document.getElementById("timeline").value;
    let customInput = document.getElementById("customTimeline");

    if (timeline === "custom") {
        customInput.style.display = "block";
    } else {
        customInput.style.display = "none";
        customInput.value = "";
    }
}

function filterBrowseJobs() {
    let searchTerm = document.getElementById("searchBox").value.toLowerCase();
    let categoryFilter = document.getElementById("categoryFilter").value;
    let budgetFilter = document.getElementById("budgetFilter").value;
    let freelancer = localStorage.getItem("currentFreelancer");
    let jobs = getJobs();
    let ignored = getIgnoredJobs();
    
    let filtered = jobs.filter(job => {
        if(job.status !== "Open") return false;
        if(ignored.includes(job.id)) return false;
        
        let matchesSearch = job.title.toLowerCase().includes(searchTerm) || 
                           job.desc.toLowerCase().includes(searchTerm);
        let matchesCategory = true;
        if (categoryFilter) {
            matchesCategory = (job.category || "")
                .toLowerCase()
                .includes(categoryFilter.toLowerCase());
        }
        let matchesBudget = true;
        if (budgetFilter) {
            let [min, max] = budgetFilter.split('-').map(Number);
            matchesBudget = job.budget >= min && 
                            (isNaN(max) || job.budget <= max);
        }
        
        return matchesSearch && matchesCategory && matchesBudget;
    });
    
    let div = document.getElementById("jobList");
    div.innerHTML = "";
    
    if(filtered.length === 0) {
        div.innerHTML = '<div class="empty-msg">No matching jobs found</div>';
        return;
    }
    
    filtered.forEach(job => {
        let applied = job.proposals.some(p => p.freelancer === freelancer);
        
        let html = `<div class="job-card">
            <div class="job-header">
                <h4>${escapeHtml(job.title)}</h4>
                <span class="status-badge">Open</span>
            </div>
            <p class="job-desc">${escapeHtml(job.desc)}</p>
            <div class="job-meta">
                <span>📂 ${job.category}</span>
                <span>⏱️ ${getRemainingDays(job)}</span>
            </div>
            <p class="job-budget">💰 $${job.budget}</p>
            <button onclick="applyJob(${job.id})" class="primary" style="width:100%; margin-top:10px; font-size:13px;" ${applied ? "disabled" : ""}>
                ${applied ? "✅ Already Applied" : "📨 Apply"}
            </button>
            <button onclick="ignoreJob(${job.id})" class="secondary" style="width:100%; margin-top:5px; font-size:13px; background-color:#f87171; color:white; border-color:#dc2626;">❌ Ignore Job</button>
        </div>`;
        
        div.innerHTML += html;
    });
}

function displayMyApplications() {
    let freelancer = localStorage.getItem("currentFreelancer");
    let jobs = getJobs();
    let div = document.getElementById("myApplications");
    let emptyMsg = document.getElementById("emptyApply");
    
    if(!div) return;
    
    div.innerHTML = "";
    
    // Show jobs where freelancer has applied
    let appliedJobs = jobs.filter(j => j.proposals.some(p => p.freelancer === freelancer));
    
    if(appliedJobs.length === 0) {
        emptyMsg.style.display = "block";
        return;
    }
    
    emptyMsg.style.display = "none";
    
    // Update proposal stats
    let pendingCount = appliedJobs.filter(j => j.status === "Open" || j.status === "Selected" && j.selected !== freelancer).length;
    let selectedCount = appliedJobs.filter(j => j.selected === freelancer).length;
    
    document.getElementById("proposalCount").textContent = appliedJobs.length;
    document.getElementById("pendingCount").textContent = pendingCount;
    document.getElementById("selectedCount").textContent = selectedCount;
    
    appliedJobs.forEach(job => {
        let isSelected = job.selected === freelancer;
        let statusClass = isSelected ? "status-selected" : "status-pending";
        
        let statusText = isSelected ? "✅ Selected" : (job.status === "Open" ? "⏳ Pending" : job.status);
        
        let html = `<div class="job-card ${statusClass}">
            <div class="job-header">
                <h4>${escapeHtml(job.title)}</h4>
                <span class="status-badge">${statusText}</span>
            </div>
            <p class="job-desc">${escapeHtml(job.desc)}</p>
            <div class="job-meta">
                <span>💰 $${job.budget}</span>
                <span>📂 ${job.category}</span>
            </div>`;
        
        if(isSelected && job.status === "Escrow Locked") {
            html += `<p style="color:#10b981; font-weight:bold; margin-top:10px;">🔒 Payment locked in escrow. You're ready to work!</p>`;
        } else if(job.status === "Open") {
            html += `<p style="color:#f59e0b; font-weight:bold; margin-top:10px;">⏳ Waiting for client decision...</p>`;
        }
        
        html += `</div>`;
        div.innerHTML += html;
    });
}

function handleCategoryChange() {
    let category = document.getElementById("category").value;
    let customInput = document.getElementById("customCategory");

    if (category === "other") {
        customInput.style.display = "block";
    } else {
        customInput.style.display = "none";
        customInput.value = "";
    }
}

function displayActiveWork() {
    let freelancer = localStorage.getItem("currentFreelancer");
    let jobs = getJobs();
    let div = document.getElementById("activeWork");
    let emptyMsg = document.getElementById("emptyWork");
    
    if(!div) return;
    
    div.innerHTML = "";
    
    // Show jobs where freelancer is selected and payment is locked
    let activeJobs = jobs.filter(j => 
        j.selected === currentAccount && 
        (j.status === "Escrow Locked" || j.status === "Work Submitted")
    );
    
   /* if(activeJobs.length === 0) {
        emptyMsg.style.display = "block";
        return;
    }
    if(job.status === "Revision Requested"){
        html += `<p style="color:#f59e0b; font-weight:600;">🔁 Revision Requested</p>`;
        
        if(job.revisionMessage){
            html += `<p style="font-size:12px;">💬 ${job.revisionMessage}</p>`;
        }
    } */
    emptyMsg.style.display = "none";
    
    // Update work stats
    let activeCount = activeJobs.filter(j => j.status === "Escrow Locked").length;
    let reviewCount = activeJobs.filter(j => j.status === "Work Submitted").length;
    
    document.getElementById("activeCount").textContent = activeCount;
    document.getElementById("reviewCount").textContent = reviewCount;
    
    activeJobs.forEach(job => {
        let statusClass = job.status === "Work Submitted" ? "status-review" : "status-active";
        
        let html = `<div class="job-card ${statusClass}">
            <div class="job-header">
                <h4>${escapeHtml(job.title)}</h4>
                <span class="status-badge">${job.status}</span>
            </div>
            <p class="job-desc">${escapeHtml(job.desc)}</p>
            <div class="job-meta">
                <span>💰 $${job.budget}</span>
                <span>⏱️ ${getRemainingDays(job)}</span>
            </div>`;
        
        if(job.status === "Escrow Locked") {
            html += `<button onclick="prepareWorkSubmission(${job.id})" class="primary" style="width:100%; margin-top:10px; font-size:13px;">⬆️ Submit Work</button>`;
        } else if(job.status === "Work Submitted") {
            html += `<p style="color:#ec4899; font-weight:bold; margin-top:10px;">⏳ Waiting for client approval...</p>`;
        }
        
        html += `</div>`;
        div.innerHTML += html;
    });
}

function prepareWorkSubmission(jobId) {
    document.getElementById("submitBtn").dataset.activeJobId = jobId;
    document.getElementById("submitWorkModal").classList.remove("hidden");
    document.getElementById("workInput").focus();
}

function displayCompletedWork() {
    let freelancer = localStorage.getItem("currentFreelancer");
    let jobs = getJobs();
    let div = document.getElementById("completedWork");
    let emptyMsg = document.getElementById("emptyCompleted");
    
    if(!div) return;
    
    div.innerHTML = "";
    
    let completedJobs = jobs.filter(j => 
        j.status === "Payment Released" &&
        j.workSubmitted &&
        j.workSubmitted.freelancer === freelancer
    );
    
    if(completedJobs.length === 0) {
        emptyMsg.style.display = "block";
        return;
    }
    
    emptyMsg.style.display = "none";
    
    completedJobs.forEach(job => {
        let html = `<div class="job-card status-completed">
            <div class="job-header">
                <h4>${escapeHtml(job.title)}</h4>
                <span class="status-badge">✅ Completed</span>
            </div>
            <p class="job-desc">${escapeHtml(job.desc)}</p>
            <div class="job-meta">
                <span>💰 ${job.budget} ETH</span>
                <span>📂 ${job.category}</span>
            </div>
            <p style="color:#10b981; font-weight:bold; margin-top:10px;">💳 Payment Released</p>
        </div>`;
        div.insertAdjacentHTML("beforeend", html);
        //div.innerHTML += html;
    });
}

/*function displayFreelancerStats() {
    let freelancer = localStorage.getItem("currentFreelancer");
    let jobs = getJobs();
    
    let applied = jobs.filter(j =>  j.proposals && j.proposals.some(p => p.freelancer === freelancer)).length;
    //let selected = jobs.filter(j => j.selected === freelancer).length;
    let selected = jobs.filter(j =>
        j.proposals &&
        j.proposals.some(p => p.freelancer === freelancer && j.selected === p.wallet)
    ).length;
    //let completed = jobs.filter(j => j.selected === freelancer && j.status === "Payment Released").length;
    let completed = jobs.filter(j =>
        j.status === "Payment Released" &&
        j.workSubmitted &&
        j.workSubmitted.freelancer === freelancer
    ).length;
    let earned = jobs
    .filter(j =>
        j.status === "Payment Released" &&
        j.workSubmitted &&
        j.workSubmitted.freelancer === freelancer
    )
    .reduce((sum, j) => sum + Number(j.budget || 0), 0);
    let successRate = applied > 0 ? Math.round((selected / applied) * 100) : 0;
    
    document.getElementById("appliedJobs").textContent = applied;
    document.getElementById("selectedCount2").textContent = selected;
    document.getElementById("completedCount").textContent = completed;
    document.getElementById("earnedAmount").textContent = earned.toFixed(4) + " ETH"; 
    document.getElementById("successRate").textContent = successRate + "%";
    let ratings = jobs
        .filter(j => j.rating && j.workSubmitted && j.workSubmitted.freelancer === freelancer)
        .map(j => j.rating);

    let avgRating = ratings.length
        ? (ratings.reduce((a,b)=>a+b)/ratings.length).toFixed(1)
        : "0";
    document.getElementById("avgRating").textContent = avgRating + "★";    
    // Update performance metrics
    let completionRate = selected > 0 ? Math.round((completed / selected) * 100) : 0;
    
    document.getElementById("perfProposal").style.width = successRate + "%";
    document.getElementById("perfProposalText").textContent = successRate + "%";
    document.getElementById("perfCompletion").style.width = completionRate + "%";
    document.getElementById("perfCompletionText").textContent = completionRate + "%";
    document.getElementById("perfSatisfaction").style.width = "85%";
    document.getElementById("perfSatisfactionText").textContent = "85%";
    
    // Update earnings display in header
    document.getElementById("earningsDisplay").textContent =earned.toFixed(4) + " ETH";
} */

function displayFreelancerStats() {
    let freelancer = localStorage.getItem("currentFreelancer"); // UI only
    let jobs = getJobs();
    // ✅ Applied (correct already)
    let applied = jobs.filter(j =>
        j.proposals && j.proposals.some(p => p.wallet === currentAccount)
    ).length;

    // ✅ Seleced (SIMPLIFIED)
    let selected = jobs.filter(j =>
        j.selected === currentAccount
    ).length;

    // ✅ Completed (FIXED → wallet)
    let completed = jobs.filter(j =>
        j.status === "Payment Released" &&
        j.workSubmitted &&
        j.workSubmitted.wallet === currentAccount
    ).length;
    // ✅ Earnings (FIXED → wallet)
    let earned = jobs
        .filter(j =>
            j.status === "Payment Released" &&
            j.workSubmitted &&
            j.workSubmitted.wallet === currentAccount
        )
        .reduce((sum, j) => sum + Number(j.budget || 0), 0);
    let successRate = applied > 0 ? Math.round((selected / applied) * 100) : 0;
    document.getElementById("appliedJobs").textContent = applied;
    document.getElementById("selectedCount2").textContent = selected;
    document.getElementById("completedCount").textContent = completed;
    document.getElementById("earnedAmount").textContent = earned.toFixed(4) + " ETH";
    document.getElementById("successRate").textContent = successRate + "%";
    // ✅ Ratings (FIXED → wallet)
    let ratings = jobs
        .filter(j => j.rating && j.workSubmitted && j.workSubmitted.wallet === currentAccount)
        .map(j => j.rating);

    let avgRating = ratings.length
        ? (ratings.reduce((a,b)=>a+b)/ratings.length).toFixed(1)
        : "0";
    document.getElementById("avgRating").textContent = avgRating + "★";
    // Performance
    let completionRate = selected > 0 ? Math.round((completed / selected) * 100) : 0;

    document.getElementById("perfProposal").style.width = successRate + "%";
    document.getElementById("perfProposalText").textContent = successRate + "%";
    document.getElementById("perfCompletion").style.width = completionRate + "%";
    document.getElementById("perfCompletionText").textContent = completionRate + "%";
    document.getElementById("perfSatisfaction").style.width = "85%";
    document.getElementById("perfSatisfactionText").textContent = "85%";

    document.getElementById("earningsDisplay").textContent = earned.toFixed(4) + " ETH";
}

/* ===== MODAL ===== */
function viewJobDetailsFreelancer(jobId) {
    let jobs = getJobs();
    let job = jobs.find(j => j.id == jobId);
    if(!job) return;
    
    let freelancer = localStorage.getItem("currentFreelancer");
    
    document.getElementById("modalTitle").textContent = job.title;
    document.getElementById("modalDesc").textContent = job.desc;
    document.getElementById("modalBudget").textContent = job.budget;
    document.getElementById("modalStatus").textContent = job.status;
    document.getElementById("modalCategory").textContent = job.category;
    document.getElementById("modalTimeline").textContent = job.timeline + " days";
    
    // Skills section
    let skillsSection = document.getElementById("skillsSection");
    if(job.skills && job.skills.length > 0) {
        skillsSection.style.display = "block";
        let skillsHtml = job.skills.map(s => `<span class="skill-tag">${escapeHtml(s)}</span>`).join('');
        document.getElementById("modalSkills").innerHTML = skillsHtml;
    } else {
        skillsSection.style.display = "none";
    }
    
    // Work details section
    let workDetailsSection = document.getElementById("workDetailsSection");
    if(job.workSubmitted) {
        workDetailsSection.style.display = "block";
        document.getElementById("workDetails").innerHTML = escapeHtml(job.workSubmitted.details);
        if(job.workSubmitted.attachment) {
            document.getElementById("workDetails").innerHTML += `<br><br><a href="${escapeHtml(job.workSubmitted.attachment)}" target="_blank">📎 View Attachment</a>`;
        }
        document.getElementById("workSubmittedTime").textContent = "Submitted: " + job.workSubmitted.submittedAt;
    } else {
        workDetailsSection.style.display = "none";
    }
    
    let applyBtn = document.getElementById("applyBtn");
    let submitBtn = document.getElementById("submitBtn");
    
    let applied = job.proposals.some(p => p.freelancer === freelancer);
    applyBtn.style.display = applied || job.status !== "Open" ? "none" : "block";
    applyBtn.dataset.jobId = jobId;
    
    submitBtn.style.display = (job.selected === freelancer && job.status === "Escrow Locked") ? "block" : "none";
    submitBtn.dataset.jobId = jobId;
    
    document.getElementById("jobModal").classList.remove("hidden");
}

function closeModal() {
    document.getElementById("jobModal").classList.add("hidden");
}

window.onclick = function(event) {
    let modal = document.getElementById("jobModal");
    if (event.target == modal) {
        modal.classList.add("hidden");
    }
}

/* ===== UTILITY ===== */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function updateJobCount() {
    let jobs = getJobs();
    document.getElementById("jobCount").textContent = jobs.length;
}

/* ===== INITIALIZE ===== */
document.addEventListener('DOMContentLoaded', function() {
    let freelancer = localStorage.getItem("currentFreelancer");
    
    // If on freelancer page, initialize views
    if(document.getElementById("jobList")) {
        displayFreelancerJobs();
    }
    
    // If on client page, initialize views
    if(document.getElementById("clientJobs")) {
        displayClientJobs();
    }
    
    // Initialize with default sample data if empty
    if(getJobs().length === 0) {
        initializeSampleData();
    }
});

function openLogin(role) {
    // For backward compatibility, but role is now determined by stored user
    document.getElementById("loginModal").classList.remove("hidden");
}

function logout() {
    localStorage.removeItem("currentFreelancer");
    localStorage.removeItem("currentAccount");
    location.href = "index.html";
}

function goToClient() {
    localStorage.removeItem('currentFreelancer');
    location.href = 'client.html';
}

/*async function confirmFreelancerLogin() {
    let name = document.getElementById("freelancerNameInput").value.trim();

    if (!name) {
        alert("Enter your name");
        return;
    }
    try {
        // 🔥 connect wallet
        await connectWallet();

        if (!currentAccount) {
            alert("Wallet not connected");
            return;
        }
        // ✅ store session
        localStorage.setItem("currentFreelancer", name);
        localStorage.setItem("currentAccount", currentAccount);
        // ✅ redirect
        let role = localStorage.getItem("userRole");
        if (role === "client") {
            window.location.href = "client.html";
        } else {
            window.location.href = "freelancer.html";
        }

    } catch (err) {
        console.error(err);
        alert("Login failed");
    }
}
*/
/*async function confirmFreelancerLogin() {
    let name = document.getElementById("freelancerNameInput").value.trim();

    if (!name) {
        alert("Enter your name");
        return;
    }
    // 🔥 CONNECT WALLET
    await connectWallet();
    if (!currentAccount) {
        alert("Wallet connection failed");
        return;
    }
    // ✅ Store session
    localStorage.setItem("currentFreelancer", name);
    localStorage.setItem("currentAccount", currentAccount);
    let role = localStorage.getItem("userRole");
    if (role === "client") {
        location.href = "client.html";
    } else {
        location.href = "freelancer.html";
    }
} */

function getUsers() {
    return JSON.parse(localStorage.getItem("users") || "{}");
}

function saveUser(wallet, userData) {
    let users = getUsers();
    users[wallet] = userData;
    localStorage.setItem("users", JSON.stringify(users));
}

function getUser(wallet) {
    let users = getUsers();
    return users[wallet];
}

function openLogin() {
    document.getElementById("loginModal").classList.remove("hidden");
}

function openSignup() {
    document.getElementById("signupModal").classList.remove("hidden");
}

function closeLoginModal() {
    document.getElementById("loginModal").classList.add("hidden");
}

function closeSignupModal() {
    document.getElementById("signupModal").classList.add("hidden");
    document.getElementById("signupNameInput").value = "";
}

async function confirmLogin() {
    try {
        await connectWallet();
        if (!currentAccount) {
            alert("Wallet not connected");
            return;
        }
        
        let user = getUser(currentAccount);
        if (!user) {
            alert("User not found. Please sign up first.");
            closeLoginModal();
            openSignup();
            return;
        }
        
        // Store session
        localStorage.setItem("currentAccount", currentAccount);
        localStorage.setItem("currentFreelancer", user.name);
        
        // Redirect based on role
        if (user.role === "client") {
            window.location.href = "client.html";
        } else {
            window.location.href = "freelancer.html";
        }
    } catch (err) {
        console.error(err);
        alert("Login failed");
    }
}

async function confirmSignup() {
    let name = document.getElementById("signupNameInput").value.trim();
    let role = document.getElementById("signupRole").value;
    
    if (!name) {
        alert("Enter your name");
        return;
    }
    
    try {
        await connectWallet();
        if (!currentAccount) {
            alert("Wallet not connected");
            return;
        }
        
        let existingUser = getUser(currentAccount);
        if (existingUser) {
            alert("User already exists. Please login instead.");
            closeSignupModal();
            openLogin();
            return;
        }
        
        // Store user
        saveUser(currentAccount, { name, role });
        
        // Store session
        localStorage.setItem("currentAccount", currentAccount);
        localStorage.setItem("currentFreelancer", name);
        
        // Redirect based on role
        if (role === "client") {
            window.location.href = "client.html";
        } else {
            window.location.href = "freelancer.html";
        }
    } catch (err) {
        console.error(err);
        alert("Signup failed");
    }
}

function initializeSampleData() {
    let sampleJobs = [
        {
            id: 1,
            title: "Build a React Dashboard",
            desc: "Create a responsive dashboard with charts, user management, and real-time data visualization. Should be mobile-friendly and integrate with REST API.",
            budget: 800,
            category: "web",
            skills: ["React", "TypeScript", "Recharts", "Tailwind CSS"],
            timeline: 14,
            proposals: [],
            selected: null,
            workSubmitted: null,
            escrow: false,
            status: "Open",
            createdAt: new Date().toLocaleString()
        },
        {
            id: 2,
            title: "Mobile App Development",
            desc: "Develop a cross-platform mobile app using React Native for both iOS and Android. Must include user authentication and push notifications.",
            budget: 1200,
            category: "mobile",
            skills: ["React Native", "Firebase", "JavaScript"],
            timeline: 30,
            proposals: [],
            selected: null,
            workSubmitted: null,
            escrow: false,
            status: "Open",
            createdAt: new Date().toLocaleString()
        },
        {
            id: 3,
            title: "UI/UX Design for SaaS",
            desc: "Design modern and intuitive user interfaces for a SaaS platform. Deliverables include wireframes, prototypes, and design system documentation.",
            budget: 600,
            category: "design",
            skills: ["Figma", "UI Design", "UX Research"],
            timeline: 21,
            proposals: [],
            selected: null,
            workSubmitted: null,
            escrow: false,
            status: "Open",
            createdAt: new Date().toLocaleString()
        }
    ];
    
    localStorage.setItem("jobs", JSON.stringify(sampleJobs));
}
window.addEventListener("load", async () => {
    await connectWallet();
});