// Firebase RTDB path definitions — all db.ref() paths go through here
const DBPath = {
  // per-user, per-building
  bldData:      (uid, bid)          => `rent_app/${uid}/${bid}`,
  roomLayout:   (uid, bid)          => `rent_app/${uid}/${bid}/config/roomLayout`,
  units:        (uid, bid)          => `rent_app/${uid}/${bid}/units`,
  unit:         (uid, bid, roomId)  => `rent_app/${uid}/${bid}/units/${roomId}`,
  unitPhoto:    (uid, bid, r, pid)  => `rent_app/${uid}/${bid}/units/${r}/photos/${pid}`,
  rentChanges:  (uid, bid, r, id)   => `rent_app/${uid}/${bid}/units/${r}/rentChanges/${id}`,
  rentHistory:  (uid, bid)          => `rent_app/${uid}/${bid}/rent_history`,
  rentHistRoom: (uid, bid, roomId)  => `rent_app/${uid}/${bid}/rent_history/${roomId}`,
  transactions: (uid, bid)          => `rent_app/${uid}/${bid}/transactions`,
  buildings:    (uid, bid)          => `rent_app/${uid}/${bid}/buildings`,
  // per-user, shared (no bid)
  bldList:      (uid)               => `rent_app/${uid}/_buildings`,
  bld:          (uid, bid)          => `rent_app/${uid}/_buildings/${bid}`,
  phonebook:    (uid)               => `rent_app/${uid}/phonebook`,
  // master admin
  masterUsers:  ()                  => `master_admin/users`,
  masterUser:   (uid)               => `master_admin/users/${uid}`,
  // signup / pending users
  pendingUsers: ()                  => `_users`,
  pendingUser:  (uid)               => `_users/${uid}`,
  pendingUserMemo: (uid)            => `_users/${uid}/memo`,
};
