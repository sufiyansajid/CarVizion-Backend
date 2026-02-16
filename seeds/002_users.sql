INSERT INTO users (id, first_name, last_name, email, password, phone, bio, avatar_url, role, created_at, updated_at) VALUES
(1, 'Muhammad Sufiyan', 'Sajid', 'sufiyansajid0000@gmail.com', '$2b$10$M0VZ3/HkCPY9YkarfsPA.OvRbRLfZgN16ucTRh9vX0U.dQXGFZgsC', '03056757497', '', '/uploads/avatars/avatar_1_1763127867666.jpeg', 'user', '2025-09-01 08:35:03', '2025-11-14 13:44:27'),
(2, 'admin', 'admin', 'admin@gmail.com', '$2b$10$yk43T3glYyEWtK07e8M7UuGgQipLJIsHVa1iBVhYoN8aoKMxJIc5u', NULL, NULL, NULL, 'user', '2025-10-20 17:19:27', '2025-10-20 17:19:27'),
(3, 'ali', 'ahmed', 'ali123@gmail.com', '$2b$10$XmTWqoE10iuNZxoHwzVJBOAF/SgAcUZSnd5IvA/nVqyYH6J./yjRW', NULL, NULL, NULL, 'user', '2026-02-11 04:40:25', '2026-02-11 04:40:25')
ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    password = VALUES(password),
    phone = VALUES(phone),
    bio = VALUES(bio),
    avatar_url = VALUES(avatar_url),
    role = VALUES(role);
