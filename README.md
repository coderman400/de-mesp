# Decentralized AI Marketplace for Medical Data 
## Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Setup & Installation](#setup--installation)


## Overview
This project is a **decentralized AI marketplace** focused on the **validation of medical data** using AI models and blockchain technology. It ensures secure and trustless data exchange between researchers and patients, with AI-driven validation techniques for medical documents and records. Blockchain ensures the immutability and transparency of transactions, while decentralized storage provides secure access to data.

## Key Features
- **Decentralized Marketplace**: A platform to exchange data and AI models in a trustless manner.
- **AI Validation**: Ensures medical data authenticity through AI models.
- **Smart Contracts**: Enables automated, transparent transactions between users.
- **Secure Data Storage**: Utilizes blockchain and decentralized storage for medical data privacy and security.
- **Role-Based Access**: Separate login for patients and researchers, ensuring appropriate data access and control.

## Tech Stack
### Frontend
- **React** for user interface and interaction.
- **Tailwind** for styling.
- **Metamask Integration** for blockchain transactions.

### Backend
- **Node.js** and **Express** for handling API requests.
- **Smart Contracts** written in **Solidity** for transaction logic.
- **Blockchain**: Ethereum blockchain and IPFS for decentralized storage.
- **FASTAPI**

### Machine Learning
- **Hugging Face Transformers** for AI model validation (BERT-based models for medical data recognition).
- **Bio_ClinicalBERT** and **Medical NER** models for named entity recognition and document validation.

### Blockchain
- **Ethereum** smart contracts for decentralized transactions.
- **IPFS** (InterPlanetary File System) for decentralized medical data storage.

## Architecture
The system consists of multiple components:
1. **Frontend (React)**: A decentralized application (DApp) allowing users to upload, validate, and exchange medical data.
2. **Blockchain (Ethereum)**: Handles all transactions between users through smart contracts.
3. **AI Model (Hugging Face)**: Validates the authenticity and relevance of medical data using fine-tuned BERT models.
4. **Storage (IPFS)**: Ensures that all medical data is securely stored and accessed in a decentralized way.

## Setup & Installation
### Prerequisites
- **Node.js** and **npm**
- **Metamask** wallet setup
- **Ganache** or other Ethereum blockchain test environment
- **IPFS** setup for decentralized file storage

### Steps to Install
1. **Clone the repository:**
   ```bash
   git clone https://github.com/coderman400/de-mesp.git
   cd de-mesp
