import { ethers } from 'ethers';
import abi from './abi.json';
const contractAddress = "0xC88091535695f5BD29d228a62E1818435196031A";
export const connectWallet = async () => {
    if (!window.ethereum) {
        alert('MetaMask not installed');
        throw new Error('MetaMask not installed');
    }
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const address = await signer.getAddress();

    return { provider, signer, address };
};

export const getContract = (signer) => {
    return new ethers.Contract(contractAddress, abi, signer);
};

export const createJob = async (ipfsHash, valueInEth) => {
    const { signer } = await connectWallet();
    const contract = getContract(signer);

    const tx = await contract.createJob(ipfsHash, {
        value: ethers.utils.parseEther(valueInEth)
    });

    await tx.wait();
};

export const assignFreelancer = async (jobId, freelancerAddress) => {
    const { signer } = await connectWallet();
    const contract = getContract(signer);

    const tx = await contract.assignFreelancer(jobId, freelancerAddress);
    await tx.wait();
};

export const approveWork = async (jobId) => {
    const { signer } = await connectWallet();
    const contract = getContract(signer);

    const tx = await contract.approveWork(jobId);
    await tx.wait();
};
