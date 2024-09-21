contract MedicalDataConsent {
    struct MedicalRecord {
        string dataHash;
        address patient;
    }

    struct Consent {
        address requester;
        bool isApproved;
    }

    // Mapping from patient address to their medical records
    mapping(address => MedicalRecord) public medicalRecords;

    // Mapping from patient address to researcher address to consent status
    mapping(address => mapping(address => Consent)) public consents;

    // Mapping to store an array of researchers who have requested access
    mapping(address => address[]) public accessRequesters;

    event DataAdded(address indexed patient, string dataHash);
    event ConsentGiven(address indexed patient, address indexed requester);
    event ConsentRevoked(address indexed patient, address indexed requester);
    event AccessRequested(address indexed researcher, address indexed patient);

    function addMedicalRecord(string memory dataHash) public {
        medicalRecords[msg.sender] = MedicalRecord(dataHash, msg.sender);
        emit DataAdded(msg.sender, dataHash);
    }

    function requestAccess(address patient) public {
        require(medicalRecords[patient].patient != address(0), "Patient does not exist");
        
        // Add researcher to accessRequesters array if not already added
        if (consents[patient][msg.sender].requester == address(0)) {
            accessRequesters[patient].push(msg.sender);
        }
        
        consents[patient][msg.sender] = Consent(msg.sender, false);
        emit AccessRequested(msg.sender, patient);
    }

    function giveConsent(address requester) public {
        require(medicalRecords[msg.sender].patient == msg.sender, "Not authorized");
        require(consents[msg.sender][requester].requester == requester, "No access request found");
        consents[msg.sender][requester].isApproved = true;
        emit ConsentGiven(msg.sender, requester);
    }

    function revokeConsent(address requester) public {
        require(medicalRecords[msg.sender].patient == msg.sender, "Not authorized");
        require(consents[msg.sender][requester].requester == requester, "No access request found");
        consents[msg.sender][requester].isApproved = false;
        emit ConsentRevoked(msg.sender, requester);
    }

    function hasConsent(address patient) public view returns (bool) {
        return consents[patient][msg.sender].isApproved;
    }

    // Function to get all researchers who requested access
    function getAccessRequesters(address patient) public view returns (address[] memory) {
        return accessRequesters[patient];
    }
}
