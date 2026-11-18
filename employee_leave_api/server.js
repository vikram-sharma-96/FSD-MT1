
const express = require("express");

const app = express();
const PORT = 3000;

// Middleware to read JSON data
app.use(express.json());

// Initial employee leave records
let leaves = [
    {
        id: 701,
        employeeName: "Ananya Singh",
        employeeCode: "EMP101",
        leaveType: "Casual",
        days: 2,
        status: "Pending"
    },
    {
        id: 702,
        employeeName: "Rahul Verma",
        employeeCode: "EMP102",
        leaveType: "Sick",
        days: 1,
        status: "Approved"
    },
    {
        id: 703,
        employeeName: "Simran Kaur",
        employeeCode: "EMP103",
        leaveType: "Earned",
        days: 3,
        status: "Rejected"
    }
];

// Generate unique IDs
let nextId = 704;

// Validate incoming leave request
function validateLeave(data) {

    if (!data || typeof data !== "object" || Array.isArray(data)) {
        return "Request body must be a JSON object";
    }

    if (typeof data.employeeName !== "string" ||
        data.employeeName.trim() === "") {
        return "Valid employeeName is required";
    }

    if (typeof data.employeeCode !== "string" ||
        data.employeeCode.trim() === "") {
        return "Valid employeeCode is required";
    }

    const allowedLeaveTypes = ["Casual", "Sick", "Earned"];

    if (!allowedLeaveTypes.includes(data.leaveType)) {
        return "leaveType must be Casual, Sick, or Earned";
    }

    if (!Number.isInteger(data.days) || data.days <= 0) {
        return "days must be a positive integer";
    }

    const allowedStatuses = ["Pending", "Approved", "Rejected"];

    if (!allowedStatuses.includes(data.status)) {
        return "status must be Pending, Approved, or Rejected";
    }

    return null;
}

// 1. GET ALL LEAVE RECORDS
app.get("/api/leaves", (req, res) => {
    res.status(200).json(leaves);
});

// 2. POST A NEW LEAVE REQUEST
app.post("/api/leaves", (req, res) => {

    const error = validateLeave(req.body);

    if (error) {
        return res.status(400).json({ error: error });
    }

    const newLeave = {
        id: nextId++,
        employeeName: req.body.employeeName.trim(),
        employeeCode: req.body.employeeCode.trim(),
        leaveType: req.body.leaveType,
        days: req.body.days,
        status: req.body.status
    };

    leaves.push(newLeave);

    res.status(201).json(newLeave);
});

// 3. FILTER LEAVES BY STATUS
app.get("/api/leaves/filter", (req, res) => {

    const status = req.query.status;

    if (typeof status !== "string" || status.trim() === "") {
        return res.status(400).json({
            error: "Please provide a status query parameter"
        });
    }

    const filteredLeaves = leaves.filter((leave) =>
        leave.status.toLowerCase() === status.trim().toLowerCase()
    );

    res.status(200).json(filteredLeaves);
});

// 4. GET PENDING LEAVE REQUESTS
app.get("/api/leaves/pending", (req, res) => {

    const pendingLeaves = leaves.filter(
        (leave) => leave.status === "Pending"
    );

    res.status(200).json(pendingLeaves);
});

// 5. GET LEAVE REQUEST BY ID
app.get("/api/leaves/:id", (req, res) => {

    const id = Number(req.params.id);

    const leave = leaves.find((item) => item.id === id);

    if (!leave) {
        return res.status(404).json({
            message: "Leave request not found"
        });
    }

    res.status(200).json(leave);
});

// 6. UPDATE LEAVE REQUEST BY ID
app.put("/api/leaves/:id", (req, res) => {

    const id = Number(req.params.id);

    const index = leaves.findIndex((item) => item.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Leave request not found"
        });
    }

    const error = validateLeave(req.body);

    if (error) {
        return res.status(400).json({ error: error });
    }

    leaves[index] = {
        id: leaves[index].id,
        employeeName: req.body.employeeName.trim(),
        employeeCode: req.body.employeeCode.trim(),
        leaveType: req.body.leaveType,
        days: req.body.days,
        status: req.body.status
    };

    res.status(200).json(leaves[index]);
});

// 7. DELETE LEAVE REQUEST BY ID
app.delete("/api/leaves/:id", (req, res) => {

    const id = Number(req.params.id);

    const index = leaves.findIndex((item) => item.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Leave request not found"
        });
    }

    const deletedLeave = leaves.splice(index, 1);

    res.status(200).json({
        message: "Leave request deleted successfully",
        deletedRecord: deletedLeave[0]
    });
});

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found"
    });
});

// Handle invalid JSON
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({
            error: "Invalid JSON body"
        });
    }

    next(err);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
