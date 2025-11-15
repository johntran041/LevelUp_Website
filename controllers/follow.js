const User = require("../models/User");

exports.followUser = async (req, res) => {
  const currentUserId = req.signedCookies?.userId;
  if (!currentUserId) {
    return res
      .status(401)
      .json({ message: "You must be logged in to follow", following: false });
  }
  const userId = req.params.userId;

  // Fixed the typo: Remove the 'f' character here

  try {
    const me = await User.findById(currentUserId);
    const other = await User.findById(userId);
    if (!me || !other) {
      return res
        .status(404)
        .json({ message: "User not found", following: false });
    }

    if (me.following.includes(userId)) {
      return res
        .status(400)
        .json({ message: "Already following", following: true });
    }

    me.following.push(userId);
    other.followers.push(currentUserId);
    await Promise.all([me.save(), other.save()]);

    res.json({ message: "Followed successfully!", following: true });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Something went wrong", following: false });
  }
};

exports.unfollowUser = async (req, res) => {
  const currentUserId = req.signedCookies?.userId;
  if (!currentUserId) {
    return res
      .status(401)
      .json({ message: "You must be logged in to unfollow", following: true });
  }
  const userId = req.params.userId;

  try {
    const me = await User.findById(currentUserId);
    const other = await User.findById(userId);
    if (!me || !other) {
      return res
        .status(404)
        .json({ message: "User not found", following: true });
    }

    if (!me.following.includes(userId)) {
      return res
        .status(400)
        .json({ message: "Not following", following: false });
    }

    me.following = me.following.filter(id => id.toString() !== userId);
    other.followers = other.followers.filter(
      id => id.toString() !== currentUserId
    );
    await Promise.all([me.save(), other.save()]);

    res.json({ message: "Unfollowed successfully!", following: false });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Something went wrong", following: true });
  }
};
