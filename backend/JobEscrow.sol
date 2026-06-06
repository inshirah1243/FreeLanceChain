// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/*
Decentralized freelancing escrow smart contract.

Requirements:
- Client can create a job and fund escrow
- Job is linked to off-chain data using IPFS hash
- Freelancer can be assigned by client
- Client can approve completed work
- Funds are released automatically on approval
- Track job lifecycle using enum
- Prevent unauthorized access using require()
*/

contract JobEscrow {

    // Define job status states
    enum JobStatus { Created, Assigned, Approved }
    struct Job {
        uint256 jobId;
        address client;
        address freelancer;
        uint256 paymentAmount;
        string ipfsHash;
        JobStatus status;
    }   
    uint256 public jobCounter;
    mapping(uint256 => Job) public jobs;
    // Event emitted when job is created
    event JobCreated(uint256 jobId, address client, uint256 paymentAmount);
    // Event emitted when payment is released
    event PaymentReleased(uint256 jobId, address freelancer);
    // Function to create a job and fund escrow
    function createJob(string memory _ipfsHash) external payable {
        require(msg.value > 0, "Payment must be greater than zero");
        jobCounter++;
        jobs[jobCounter] = Job({
            jobId: jobCounter,
            client: msg.sender,
            freelancer: address(0),
            paymentAmount: msg.value,
            ipfsHash: _ipfsHash,
            status: JobStatus.Created
        });
        emit JobCreated(jobCounter, msg.sender, msg.value);
    }
    // Function to assign freelancer to job
    function assignFreelancer(uint256 _jobId, address _freelancer) external {
        Job storage job = jobs[_jobId];
        require(msg.sender == job.client, "Only client can assign freelancer");
        require(job.status == JobStatus.Created, "Job must be in Created status");
        require(_freelancer != address(0), "Invalid freelancer address");
        job.freelancer = _freelancer;
        job.status = JobStatus.Assigned;
    }
    // Function for client to approve completed work and release payment
    function approveWork(uint256 _jobId) external {
        Job storage job = jobs[_jobId];
        require(msg.sender == job.client, "Only client can approve work");
        require(job.status == JobStatus.Assigned, "Job must be in Assigned status");
        require(job.status != JobStatus.Approved, "Already approved");
        job.status = JobStatus.Approved;
        payable(job.freelancer).transfer(job.paymentAmount);
        emit PaymentReleased(_jobId, job.freelancer);
    }
    

}
