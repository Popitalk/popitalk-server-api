const formatUsersAndRelationships = (id, relationships) => {
  const notMe = (id1, id2) => (id === id1 ? id2 : id1);

  const fuar = {
    users: {},
    relationships: {
      friends: [],
      sentFriendRequests: [],
      receivedFriendRequests: [],
      blocked: [],
      blockers: []
    }
  };

  relationships.forEach(relationship => {
    if (relationship.type === "friend_both") {
      fuar.relationships.friends.push(
        notMe(relationship.firstUserId, relationship.secondUserId)
      );
      fuar.users[notMe(relationship.firstUserId, relationship.secondUserId)] =
        relationship.userInfo;
    } else if (relationship.type === "block_both") {
      fuar.relationships.blocked.push(
        notMe(relationship.firstUserId, relationship.secondUserId)
      );
      fuar.relationships.blockers.push(
        notMe(relationship.firstUserId, relationship.secondUserId)
      );
      fuar.users[notMe(relationship.firstUserId, relationship.secondUserId)] =
        relationship.userInfo;
    } else if (
      (id === relationship.firstUserId &&
        relationship.type === "friend_first_second") ||
      (id === relationship.secondUserId &&
        relationship.type === "friend_second_first")
    ) {
      fuar.relationships.sentFriendRequests.push(
        notMe(relationship.firstUserId, relationship.secondUserId)
      );
      fuar.users[notMe(relationship.firstUserId, relationship.secondUserId)] =
        relationship.userInfo;
    } else if (
      (id === relationship.firstUserId &&
        relationship.type === "friend_second_first") ||
      (id === relationship.secondUserId &&
        relationship.type === "friend_first_second")
    ) {
      fuar.relationships.receivedFriendRequests.push(
        notMe(relationship.firstUserId, relationship.secondUserId)
      );
      fuar.users[notMe(relationship.firstUserId, relationship.secondUserId)] =
        relationship.userInfo;
    } else if (
      (id === relationship.firstUserId &&
        relationship.type === "block_first_second") ||
      (id === relationship.secondUserId &&
        relationship.type === "block_second_first")
    ) {
      fuar.relationships.blocked.push(
        notMe(relationship.firstUserId, relationship.secondUserId)
      );
      fuar.users[notMe(relationship.firstUserId, relationship.secondUserId)] =
        relationship.userInfo;
    } else if (
      (id === relationship.firstUserId &&
        relationship.type === "block_second_first") ||
      (id === relationship.secondUserId &&
        relationship.type === "block_first_second")
    ) {
      fuar.relationships.blockers.push(
        notMe(relationship.firstUserId, relationship.secondUserId)
      );
      fuar.users[notMe(relationship.firstUserId, relationship.secondUserId)] =
        relationship.userInfo;
    }
  });

  return fuar;
};

module.exports = formatUsersAndRelationships;
