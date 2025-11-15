const Message = require("../models/Message");
const User = require("../models/User");

//Render chat Page
exports.renderChatPage = async (req, res) => {
    const currentUserId = req.user?._id;
    if (!currentUserId) {
        return res.status(401).json({ redirect: "/auth/login" });
    }

    const currentUser = await User.findById(currentUserId).populate(
        "following",
        "email"
    );

    // Get users who have messaged me or I have messaged
    const messageContacts = await Message.aggregate([
        {
            $match: {
                $or: [{ sender: currentUserId }, { recipient: currentUserId }],
                deletedBy: { $ne: currentUserId }, // Don't include conversations deleted by current user
            },
        },
        {
            $project: {
                contactId: {
                    $cond: [
                        { $eq: ["$sender", currentUserId] },
                        "$recipient",
                        "$sender",
                    ],
                },
            },
        },
        {
            $group: {
                _id: "$contactId",
            },
        },
    ]);
    const messagedIds = messageContacts.map((entry) => entry._id.toString());

    // Get users I follow
    const followingIds = currentUser.following.map((user) =>
        user._id.toString()
    );

    // Get users who follow me
    const followers = await User.find({ following: currentUserId }, "_id");
    const followerIds = followers.map((u) => u._id.toString());

    // Combine all into contact list
    const contactIds = [
        ...new Set([...messagedIds, ...followingIds, ...followerIds]),
    ];

    //Get user info for those contacts
    const contactsRaw = await User.find({ _id: { $in: contactIds } });

    //Attach last message to each contact
    const contacts = await Promise.all(
        contactsRaw.map(async (contact) => {
            const lastMsg = await Message.findOne({
                $or: [
                    { sender: currentUserId, recipient: contact._id },
                    { sender: contact._id, recipient: currentUserId },
                ],
                deletedBy: { $ne: currentUserId },
            }).sort({ createdAt: -1 });

            return {
                ...contact.toObject(),
                lastMessage: lastMsg
                    ? lastMsg.text ||
                      (lastMsg.attachment
                          ? `Sent a file: ${lastMsg.attachment
                                .split("/")
                                .pop()}`
                          : null)
                    : null,
                lastMessageTime: lastMsg ? lastMsg.createdAt : new Date(0),
            };
        })
    );

    // Sort contacts by last message time
    contacts.sort(
        (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    );

    // Load messages if a contact is selected
    const contactId = req.query.contactId;
    let selectedContact = null;
    let messages = [];

    if (contactId) {
        selectedContact = await User.findById(contactId);
        messages = await Message.find({
            $or: [
                { sender: currentUserId, recipient: contactId },
                { sender: contactId, recipient: currentUserId },
            ],
            deletedBy: { $ne: currentUserId },
        }).sort({ createdAt: 1 });
    }

    res.render("message", {
        contacts,
        selectedContact,
        messages,
        currentUserId,
    });
};

//Get message from users
exports.getMessages = async (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.user?._id;

    if (!currentUserId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const messages = await Message.find({
            $or: [
                { sender: currentUserId, recipient: userId },
                { sender: userId, recipient: currentUserId },
            ],
            deletedBy: { $ne: currentUserId },
        }).sort({ timestamp: 1 });

        res.json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
};

//Send message to user
exports.sendMessage = async (req, res) => {
    const { recipientId, text } = req.body;
    const senderId = req.user?._id;

    if (!senderId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    let attachmentUrl = null;
    if (req.file) {
        attachmentUrl = `/uploads/${req.file.filename}`;
    }

    try {
        const message = new Message({
            sender: senderId,
            recipient: recipientId,
            text: text,
            attachment: attachmentUrl,
            deletedBy: [], // Initialize empty deletedBy array
        });

        await message.save();
        res.status(200).json(message);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to send message" });
    }
};

//Delete the chat
exports.deleteChat = async (req, res) => {
    const { contactId } = req.params;
    const currentUserId = req.user?._id;

    if (!currentUserId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        await Message.updateMany(
            {
                $or: [
                    { sender: currentUserId, recipient: contactId },
                    { sender: contactId, recipient: currentUserId },
                ],
            },
            {
                $addToSet: { deletedBy: currentUserId },
            }
        );

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error deleting chat:", error);
        return res
            .status(500)
            .json({ success: false, error: "Failed to delete chat." });
    }
};
