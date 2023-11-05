import User from '../models/userModel.js';

// ################# GET USER ####################
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    // find user by id
    const user = await User.findById({ _id: id });

    // if no user
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user!',
      });
    }
    // If the user is found, return the response
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    // return error
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ################# GET USER FRIENDS ######################
export const getUserFriends = async (req, res) => {
  try {
    const { id } = req.params;

    // find user by id
    const user = await User.findById({ _id: id });

    // Fetch information about friends by concurrently executing User.findById for each friend ID

    //  This line of code uses Promise.all to concurrently execute multiple asynchronous User.findById operations for each _id in the user.friends array
    const friends = await Promise.all(
      user.friends.map((_id) => User.findById({ _id }))
    );

    // formatted the friends information and return those
    const formattedFriends = friends.map(
      ({
        _id,
        firstname,
        lastname,
        email,
        username,
        profileImage,
        location,
        occupassion,
        profileViews,
        impression,
      }) => {
        return {
          _id,
          firstname,
          lastname,
          email,
          username,
          profileImage,
          location,
          occupassion,
          profileViews,
          impression,
        };
      }
    );

    // return the response with formatted friends
    return res.status(200).json({ data: formattedFriends });
  } catch (error) {
    // return error
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ############### ADD REMOVE FRIEND ################
export const addRemoveFriend = async (req, res) => {
  try {
    const { id, friendId } = req.params;

    // find user by userId (id)
    const user = await User.findById({ _id: id });

    // find friend by friendId
    const friend = await User.findById({ _id: friendId });

    // Check if 'friendId' is already in 'user.friends'.
    // If yes, remove it from both 'user.friends' and 'friend.friends'.
    // If not, add 'friendId' to 'user.friends' and 'id' to 'friend.friends'.
    if (user.friends.includes(friendId)) {
      user.friends = user.friends.filter((_id) => _id !== friendId);
      friend.friends = friend.friends.filter((_id) => _id !== id);
    } else {
      user.friends.push(friendId);
      friend.friends.push(id);
    }
    // finally save the user to database
    await user.save();

    // finally save the friend to database
    await friend.save();

    // Fetch information about friends by concurrently executing User.findById for each friend ID

    //  This line of code uses Promise.all to concurrently execute multiple asynchronous User.findById operations for each _id in the user.friends array
    const friends = await Promise.all(
      user.friends.map((_id) => User.findById({ _id }))
    );

    const formattedFriends = friends.map(
      ({
        _id,
        firstname,
        lastname,
        email,
        username,
        profileImage,
        location,
        occupassion,
        profileViews,
        impression,
      }) => {
        return {
          _id,
          firstname,
          lastname,
          email,
          username,
          profileImage,
          location,
          occupassion,
          profileViews,
          impression,
        };
      }
    );
    // return response with formatted friends
    return res.status(200).json(formattedFriends);
  } catch (error) {
    //  return error
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
