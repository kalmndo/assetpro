--
-- PostgreSQL database dump
--

-- Dumped from database version 14.12 (Homebrew)
-- Dumped by pg_dump version 14.12 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: Organisasi; Type: TABLE DATA; Schema: public; Owner: kalmndo
--

INSERT INTO public."Organisasi" (id, name, "createdAt", "updatedAt") VALUES ('1', 'Darmajaya', '2024-08-14 15:33:32.76', '2024-08-14 15:33:31.328');


--
-- Data for Name: Department; Type: TABLE DATA; Schema: public; Owner: kalmndo
--

INSERT INTO public."Department" (id, name, "organisasiId", "createdAt", "updatedAt") VALUES ('1', 'ICT', '1', '2024-08-14 15:33:49.347', '2024-08-14 15:33:48.543');
INSERT INTO public."Department" (id, name, "organisasiId", "createdAt", "updatedAt") VALUES ('clzvcrfyv0003bcyfr7c6qlx2', 'MAL', '1', '2024-08-15 14:05:15.031', '2024-08-15 14:05:15.031');
INSERT INTO public."Department" (id, name, "organisasiId", "createdAt", "updatedAt") VALUES ('clzxn6rdl003psj3pxyv1hmgx', 'Wakil Rektor 2', '1', '2024-08-17 04:32:38.168', '2024-08-17 04:32:38.168');
INSERT INTO public."Department" (id, name, "organisasiId", "createdAt", "updatedAt") VALUES ('clzxn6zu7003rsj3pbh1gadlp', 'Ketua Yayasan', '1', '2024-08-17 04:32:49.135', '2024-08-17 04:32:49.135');


--
-- Data for Name: DepartmentUnit; Type: TABLE DATA; Schema: public; Owner: kalmndo
--

INSERT INTO public."DepartmentUnit" (id, name, "departmentId", "createdAt", "updatedAt") VALUES ('clzws652v000xa1hudqpo2wim', 'Peminjaman', 'clzvcrfyv0003bcyfr7c6qlx2', '2024-08-16 14:04:21.174', '2024-08-16 14:04:21.174');


--
-- Data for Name: Vendor; Type: TABLE DATA; Schema: public; Owner: kalmndo
--

INSERT INTO public."Vendor" (id, name, alamat, whatsapp, nohp, email, "createdAt", "updatedAt") VALUES ('1', 'CV Mulya Agung', 'Kedaton', '081272035456', '081272035456', 'kalmndo@gmail.com', '2024-08-17 11:07:48.912', '2024-08-17 11:07:38.309');
INSERT INTO public."Vendor" (id, name, alamat, whatsapp, nohp, email, "createdAt", "updatedAt") VALUES ('2', 'CV Agung Podomoro', 'Kedaton', '081272035456', '081272035456', 'kalmndo@gmail.com', '2024-08-17 11:07:48.912', '2024-08-17 11:07:38.309');


--
-- Data for Name: MasterBarangGolongan; Type: TABLE DATA; Schema: public; Owner: kalmndo
--

INSERT INTO public."MasterBarangGolongan" (id, name, code, "createdAt", "updatedAt") VALUES ('1', 'Aset', 1, '2024-08-14 15:45:53.182', '2024-08-14 15:45:42.649');
INSERT INTO public."MasterBarangGolongan" (id, name, code, "createdAt", "updatedAt") VALUES ('2', 'Persediaan', 2, '2024-08-14 15:45:53.192', '2024-08-14 15:45:42.649');


--
-- Data for Name: MasterBarangKategori; Type: TABLE DATA; Schema: public; Owner: kalmndo
--

INSERT INTO public."MasterBarangKategori" (id, name, code, "classCode", "fullCode", "golonganId", "createdAt", "updatedAt") VALUES ('clztlxcof00011vux29oqfpwl', 'Peralatan Kantor', 3, '1', '1.3', '1', '2024-08-14 08:46:14.895', '2024-08-14 08:46:14.895');
INSERT INTO public."MasterBarangKategori" (id, name, code, "classCode", "fullCode", "golonganId", "createdAt", "updatedAt") VALUES ('clztlxt0f00031vuxpat3013q', 'Mesin', 4, '1', '1.4', '1', '2024-08-14 08:46:36.062', '2024-08-14 08:46:36.062');
INSERT INTO public."MasterBarangKategori" (id, name, code, "classCode", "fullCode", "golonganId", "createdAt", "updatedAt") VALUES ('clztlyvgt00051vuxbb7tex4d', 'Kendaraan', 5, '1', '1.5', '1', '2024-08-14 08:47:25.9', '2024-08-14 08:47:25.9');


--
-- Data for Name: MasterBarangSubKategori; Type: TABLE DATA; Schema: public; Owner: kalmndo
--

INSERT INTO public."MasterBarangSubKategori" (id, name, code, "classCode", "fullCode", "kategoriId", "createdAt", "updatedAt") VALUES ('clztlzbtt00071vuxvbiv6ke1', 'Komputer', 1, '1.3', '1.3.1', 'clztlxcof00011vux29oqfpwl', '2024-08-14 08:47:47.105', '2024-08-14 08:47:47.105');
INSERT INTO public."MasterBarangSubKategori" (id, name, code, "classCode", "fullCode", "kategoriId", "createdAt", "updatedAt") VALUES ('clztlzjsx00091vuxc8dqni18', 'Laptop', 2, '1.3', '1.3.2', 'clztlxcof00011vux29oqfpwl', '2024-08-14 08:47:57.441', '2024-08-14 08:47:57.441');


--
-- Data for Name: MasterBarangSubSubKategori; Type: TABLE DATA; Schema: public; Owner: kalmndo
--

INSERT INTO public."MasterBarangSubSubKategori" (id, name, code, "classCode", "fullCode", "subKategoriId", umur, "createdAt", "updatedAt", minimum) VALUES ('clztm5hpo000h1vux1z7tcqvh', 'Notebook', 3, '1.3.2', '1.3.2.3', 'clztlzjsx00091vuxc8dqni18', 5, '2024-08-14 08:52:34.668', '2024-08-14 10:05:20.389', NULL);
INSERT INTO public."MasterBarangSubSubKategori" (id, name, code, "classCode", "fullCode", "subKategoriId", umur, "createdAt", "updatedAt", minimum) VALUES ('clztm1223000d1vuxf3s2in6u', 'Komputer AIO', 1, '1.3.1', '1.3.1.1', 'clztlzbtt00071vuxvbiv6ke1', 5, '2024-08-14 08:49:07.754', '2024-08-14 08:49:07.754', NULL);
INSERT INTO public."MasterBarangSubSubKategori" (id, name, code, "classCode", "fullCode", "subKategoriId", umur, "createdAt", "updatedAt", minimum) VALUES ('clztm4bmy000f1vuxyql1ph3z', 'Macbook', 2, '1.3.2', '1.3.2.2', 'clztlzjsx00091vuxc8dqni18', NULL, '2024-08-14 08:51:40.138', '2024-08-14 08:51:40.138', NULL);


--
-- Data for Name: MasterUnit; Type: TABLE DATA; Schema: public; Owner: kalmndo
--

INSERT INTO public."MasterUnit" (id, name, "createdAt", "updatedAt") VALUES ('PCS', 'PCS', '2024-08-14 17:10:32.433', '2024-08-14 17:10:31.335');


--
-- Data for Name: MasterBarang; Type: TABLE DATA; Schema: public; Owner: kalmndo
--

INSERT INTO public."MasterBarang" (id, image, name, code, "classCode", "fullCode", "subSubKategoriId", "uomId", deskripsi, "createdAt", "updatedAt") VALUES ('clztoymo800045rmyw48q35jj', '', 'Macbook Pro M1', 1, '1.3.2.2', '1.3.2.2.1', 'clztm4bmy000f1vuxyql1ph3z', 'PCS', 'Macbook Pro M1', '2024-08-14 10:11:13.341', '2024-08-14 10:11:13.341');


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: kalmndo
--

INSERT INTO public."User" (id, name, email, image, password, title, "departmentId", "departmentUnitId", "atasanId", "createdAt", "updatedAt") VALUES ('clzvcsjng0005bcyfhgzy0954', 'sadat', 'sadat@gmail.com', '', '$2a$10$qPsM.PgFFkyKG0OIcgnzTOWTN95kyyy/XsvyxulUOIcKmhLzrGBKi', 'Kepala', 'clzvcrfyv0003bcyfr7c6qlx2', NULL, NULL, '2024-08-15 14:06:06.459', '2024-08-16 12:59:34.674');
INSERT INTO public."User" (id, name, email, image, password, title, "departmentId", "departmentUnitId", "atasanId", "createdAt", "updatedAt") VALUES ('clzvcqlgn0001bcyfy2ieorm3', 'asep', 'asep@gmail.com', '', '$2a$10$PQRHMBlS1tOg5HgFhhVGIeIqlecaW1F8VhfaujiHPYUf/OFY20M5i', 'Kepala', '1', NULL, 'clzvcsjng0005bcyfhgzy0954', '2024-08-15 14:04:35.485', '2024-08-17 04:03:02.101');
INSERT INTO public."User" (id, name, email, image, password, title, "departmentId", "departmentUnitId", "atasanId", "createdAt", "updatedAt") VALUES ('1', 'adam', 'adam@gmail.com', NULL, '$2y$10$WBTNEI.JxfnPK8LjrFQnb.YPKWzyGYTR2JRvMwwg076w.YIgV64gG', 'Admin', '1', NULL, 'clzvcqlgn0001bcyfy2ieorm3', '2024-08-14 15:34:00.669', '2024-08-16 13:40:37.49');
INSERT INTO public."User" (id, name, email, image, password, title, "departmentId", "departmentUnitId", "atasanId", "createdAt", "updatedAt") VALUES ('clzws76fx000za1hu1rhx7qfp', 'alda', 'alda@gmail.com', '', '$2a$10$liLhnFR0oYcd6nFY4JnN2uTb7qCj4xCmQje9pO4ecr/Dl330AmY8y', 'Kepala Unit', 'clzvcrfyv0003bcyfr7c6qlx2', 'clzws652v000xa1hudqpo2wim', NULL, '2024-08-16 14:05:09.596', '2024-08-16 14:05:09.596');
INSERT INTO public."User" (id, name, email, image, password, title, "departmentId", "departmentUnitId", "atasanId", "createdAt", "updatedAt") VALUES ('clzxn7wfe003tsj3pwy2hrv8p', 'Roni', 'roni@gmail.com', '', '$2a$10$7oVibcI0yFhRqLdJf3pMc.VpbAQYciKTgIsdwHJFP8gYsLQRvD0y6', 'Kepala', 'clzxn6rdl003psj3pxyv1hmgx', NULL, NULL, '2024-08-17 04:33:31.359', '2024-08-17 04:33:31.359');
INSERT INTO public."User" (id, name, email, image, password, title, "departmentId", "departmentUnitId", "atasanId", "createdAt", "updatedAt") VALUES ('clzxn8fx8003xsj3pvgufv45w', 'Ary Meizari', 'ary@gmail.com', '', '$2a$10$8Uow5HVj4U223gjzco4.GuHR/4h6f/3n4d4umq4iavJQlhexcXhsO', 'Ketua', 'clzxn6zu7003rsj3pbh1gadlp', NULL, NULL, '2024-08-17 04:33:56.636', '2024-08-17 04:33:56.636');


--
-- Data for Name: MasterRuang; Type: TABLE DATA; Schema: public; Owner: kalmndo
--

INSERT INTO public."MasterRuang" (id, name, "createdAt", "updatedAt") VALUES ('clztqjhmc0000q7qni2yqlgoj', 'Meeting', '2024-08-14 10:55:26.196', '2024-08-14 10:55:26.196');


--
-- Data for Name: MasterKodeAnggaran; Type: TABLE DATA; Schema: public; Owner: kalmndo
--

INSERT INTO public."MasterKodeAnggaran" (id, name, nilai, "departmentId", "createdAt", "updatedAt") VALUES ('1', 'Peralatan komputer', 2000000, '1', '2024-08-17 10:55:21.457', '2024-08-17 10:55:20.416');


--
-- Data for Name: Role; Type: TABLE DATA; Schema: public; Owner: kalmndo
--

INSERT INTO public."Role" (id, "createdAt", "updatedAt") VALUES ('laporan-view', '2024-08-14 15:43:40.431', '2024-08-14 15:43:40.431');
INSERT INTO public."Role" (id, "createdAt", "updatedAt") VALUES ('aset-view', '2024-08-14 15:43:40.431', '2024-08-14 15:43:40.431');
INSERT INTO public."Role" (id, "createdAt", "updatedAt") VALUES ('stock-view', '2024-08-14 15:43:40.431', '2024-08-14 15:43:40.431');
INSERT INTO public."Role" (id, "createdAt", "updatedAt") VALUES ('im-view', '2024-08-14 15:43:40.431', '2024-08-14 15:43:40.431');
INSERT INTO public."Role" (id, "createdAt", "updatedAt") VALUES ('im-approve', '2024-08-14 15:43:40.431', '2024-08-14 15:43:40.431');
INSERT INTO public."Role" (id, "createdAt", "updatedAt") VALUES ('pembelian-view', '2024-08-14 15:43:40.431', '2024-08-14 15:43:40.431');
INSERT INTO public."Role" (id, "createdAt", "updatedAt") VALUES ('pembelian-approve', '2024-08-14 15:43:40.431', '2024-08-14 15:43:40.431');
INSERT INTO public."Role" (id, "createdAt", "updatedAt") VALUES ('penawaran-view', '2024-08-14 15:43:40.431', '2024-08-14 15:43:40.431');
INSERT INTO public."Role" (id, "createdAt", "updatedAt") VALUES ('pembelian-select-vendor', '2024-08-14 15:43:40.431', '2024-08-14 15:43:40.431');
INSERT INTO public."Role" (id, "createdAt", "updatedAt") VALUES ('nego-view', '2024-08-14 15:43:40.431', '2024-08-14 15:43:40.431');
INSERT INTO public."Role" (id, "createdAt", "updatedAt") VALUES ('nego-submit', '2024-08-14 15:43:40.431', '2024-08-14 15:43:40.431');
INSERT INTO public."Role" (id, "createdAt", "updatedAt") VALUES ('evaluasi-read', '2024-08-14 15:43:40.431', '2024-08-14 15:43:40.431');
INSERT INTO public."Role" (id, "createdAt", "updatedAt") VALUES ('evaluasi-approve', '2024-08-14 15:43:40.431', '2024-08-14 15:43:40.431');
INSERT INTO public."Role" (id, "createdAt", "updatedAt") VALUES ('po-view', '2024-08-14 15:43:40.431', '2024-08-14 15:43:40.431');
INSERT INTO public."Role" (id, "createdAt", "updatedAt") VALUES ('gudang-request-view', '2024-08-14 15:43:40.431', '2024-08-14 15:43:40.431');
INSERT INTO public."Role" (id, "createdAt", "updatedAt") VALUES ('gudang-masuk-view', '2024-08-14 15:43:40.431', '2024-08-14 15:43:40.431');
INSERT INTO public."Role" (id, "createdAt", "updatedAt") VALUES ('gudang-keluar-view', '2024-08-14 15:43:40.431', '2024-08-14 15:43:40.431');
INSERT INTO public."Role" (id, "createdAt", "updatedAt") VALUES ('mutasi-view', '2024-08-14 15:43:40.431', '2024-08-14 15:43:40.431');
INSERT INTO public."Role" (id, "createdAt", "updatedAt") VALUES ('perbaikan-permintaan-view', '2024-08-14 15:43:40.431', '2024-08-14 15:43:40.431');
INSERT INTO public."Role" (id, "createdAt", "updatedAt") VALUES ('perbaikan-select-approve', '2024-08-14 15:43:40.431', '2024-08-14 15:43:40.431');
INSERT INTO public."Role" (id, "createdAt", "updatedAt") VALUES ('perbaikan-eksternal-view', '2024-08-14 15:43:40.431', '2024-08-14 15:43:40.431');
INSERT INTO public."Role" (id, "createdAt", "updatedAt") VALUES ('perbaikan-eksternal-komponen', '2024-08-14 15:43:40.431', '2024-08-14 15:43:40.431');
INSERT INTO public."Role" (id, "createdAt", "updatedAt") VALUES ('perbaikan-eksternal-diserahkan-ke-vendor', '2024-08-14 15:43:40.431', '2024-08-14 15:43:40.431');
INSERT INTO public."Role" (id, "createdAt", "updatedAt") VALUES ('perbaikan-eksternal-terima', '2024-08-14 15:43:40.431', '2024-08-14 15:43:40.431');
INSERT INTO public."Role" (id, "createdAt", "updatedAt") VALUES ('perbaikan-eksternal-diserahkan-ke-user', '2024-08-14 15:43:40.431', '2024-08-14 15:43:40.431');
INSERT INTO public."Role" (id, "createdAt", "updatedAt") VALUES ('peminjaman-internal-view', '2024-08-14 15:43:40.431', '2024-08-14 15:43:40.431');
INSERT INTO public."Role" (id, "createdAt", "updatedAt") VALUES ('peminjaman-eksternal-view', '2024-08-14 15:43:40.431', '2024-08-14 15:43:40.431');
INSERT INTO public."Role" (id, "createdAt", "updatedAt") VALUES ('master-view', '2024-08-14 15:43:40.431', '2024-08-14 15:43:40.431');
INSERT INTO public."Role" (id, "createdAt", "updatedAt") VALUES ('pengaturan-view', '2024-08-14 15:43:40.431', '2024-08-14 15:43:40.431');
INSERT INTO public."Role" (id, "createdAt", "updatedAt") VALUES ('peminjaman-internal-approve', '2024-08-14 15:43:40.431', '2024-08-14 15:43:40.431');
INSERT INTO public."Role" (id, "createdAt", "updatedAt") VALUES ('peminjaman-internal-send-to-user', '2024-08-14 15:43:40.431', '2024-08-14 15:43:40.431');
INSERT INTO public."Role" (id, "createdAt", "updatedAt") VALUES ('peminjaman-internal-receive-from-user', '2024-08-14 15:43:40.431', '2024-08-14 15:43:40.431');
INSERT INTO public."Role" (id, "createdAt", "updatedAt") VALUES ('peminjaman-eksternal-create', '2024-08-14 15:43:40.431', '2024-08-14 15:43:40.431');
INSERT INTO public."Role" (id, "createdAt", "updatedAt") VALUES ('peminjaman-eksternal-approve', '2024-08-14 15:43:40.431', '2024-08-14 15:43:40.431');
INSERT INTO public."Role" (id, "createdAt", "updatedAt") VALUES ('peminjaman-eksternal-send-to-user', '2024-08-14 15:43:40.431', '2024-08-14 15:43:40.431');
INSERT INTO public."Role" (id, "createdAt", "updatedAt") VALUES ('peminjaman-eksternal-receive-from-user', '2024-08-14 15:43:40.431', '2024-08-14 15:43:40.431');


--
-- Data for Name: UserRole; Type: TABLE DATA; Schema: public; Owner: kalmndo
--

INSERT INTO public."UserRole" (id, "roleId", "userId", "createdAt", "updatedAt") VALUES ('1', 'master-view', '1', '2024-08-14 15:44:25.201', '2024-08-14 15:44:08.057');
INSERT INTO public."UserRole" (id, "roleId", "userId", "createdAt", "updatedAt") VALUES ('clzvcsjng0006bcyfy10q2fwm', 'laporan-view', 'clzvcsjng0005bcyfhgzy0954', '2024-08-15 14:06:06.459', '2024-08-15 14:06:06.459');
INSERT INTO public."UserRole" (id, "roleId", "userId", "createdAt", "updatedAt") VALUES ('clzvcsjng0007bcyf63vi3xrf', 'aset-view', 'clzvcsjng0005bcyfhgzy0954', '2024-08-15 14:06:06.459', '2024-08-15 14:06:06.459');
INSERT INTO public."UserRole" (id, "roleId", "userId", "createdAt", "updatedAt") VALUES ('clzvcsjng0008bcyf19jvtbji', 'stock-view', 'clzvcsjng0005bcyfhgzy0954', '2024-08-15 14:06:06.459', '2024-08-15 14:06:06.459');
INSERT INTO public."UserRole" (id, "roleId", "userId", "createdAt", "updatedAt") VALUES ('clzvcsjng0009bcyfevr4et05', 'im-view', 'clzvcsjng0005bcyfhgzy0954', '2024-08-15 14:06:06.459', '2024-08-15 14:06:06.459');
INSERT INTO public."UserRole" (id, "roleId", "userId", "createdAt", "updatedAt") VALUES ('clzvcsjng000abcyfbrgkheji', 'im-approve', 'clzvcsjng0005bcyfhgzy0954', '2024-08-15 14:06:06.459', '2024-08-15 14:06:06.459');
INSERT INTO public."UserRole" (id, "roleId", "userId", "createdAt", "updatedAt") VALUES ('clzvcsjng000bbcyfxyyvu6el', 'pembelian-view', 'clzvcsjng0005bcyfhgzy0954', '2024-08-15 14:06:06.459', '2024-08-15 14:06:06.459');
INSERT INTO public."UserRole" (id, "roleId", "userId", "createdAt", "updatedAt") VALUES ('clzvcsjng000cbcyfbp6fg532', 'pembelian-approve', 'clzvcsjng0005bcyfhgzy0954', '2024-08-15 14:06:06.459', '2024-08-15 14:06:06.459');
INSERT INTO public."UserRole" (id, "roleId", "userId", "createdAt", "updatedAt") VALUES ('clzvcsjng000dbcyf3h08vh7c', 'penawaran-view', 'clzvcsjng0005bcyfhgzy0954', '2024-08-15 14:06:06.459', '2024-08-15 14:06:06.459');
INSERT INTO public."UserRole" (id, "roleId", "userId", "createdAt", "updatedAt") VALUES ('clzvcsjng000ebcyfydo8tdr3', 'pembelian-select-vendor', 'clzvcsjng0005bcyfhgzy0954', '2024-08-15 14:06:06.459', '2024-08-15 14:06:06.459');
INSERT INTO public."UserRole" (id, "roleId", "userId", "createdAt", "updatedAt") VALUES ('clzvcsjng000fbcyfcxyk0x0t', 'nego-view', 'clzvcsjng0005bcyfhgzy0954', '2024-08-15 14:06:06.459', '2024-08-15 14:06:06.459');
INSERT INTO public."UserRole" (id, "roleId", "userId", "createdAt", "updatedAt") VALUES ('clzvcsjng000gbcyforoip4rw', 'nego-submit', 'clzvcsjng0005bcyfhgzy0954', '2024-08-15 14:06:06.459', '2024-08-15 14:06:06.459');
INSERT INTO public."UserRole" (id, "roleId", "userId", "createdAt", "updatedAt") VALUES ('clzvcsjng000hbcyf0o117fo8', 'evaluasi-read', 'clzvcsjng0005bcyfhgzy0954', '2024-08-15 14:06:06.459', '2024-08-15 14:06:06.459');
INSERT INTO public."UserRole" (id, "roleId", "userId", "createdAt", "updatedAt") VALUES ('clzvcsjng000ibcyfawy8pk3i', 'evaluasi-approve', 'clzvcsjng0005bcyfhgzy0954', '2024-08-15 14:06:06.459', '2024-08-15 14:06:06.459');
INSERT INTO public."UserRole" (id, "roleId", "userId", "createdAt", "updatedAt") VALUES ('clzvcsjng000jbcyf6qrhvvzk', 'po-view', 'clzvcsjng0005bcyfhgzy0954', '2024-08-15 14:06:06.459', '2024-08-15 14:06:06.459');
INSERT INTO public."UserRole" (id, "roleId", "userId", "createdAt", "updatedAt") VALUES ('clzvcsjng000kbcyfum3rprgi', 'gudang-request-view', 'clzvcsjng0005bcyfhgzy0954', '2024-08-15 14:06:06.459', '2024-08-15 14:06:06.459');
INSERT INTO public."UserRole" (id, "roleId", "userId", "createdAt", "updatedAt") VALUES ('clzvcsjng000lbcyf25jm5gwi', 'gudang-masuk-view', 'clzvcsjng0005bcyfhgzy0954', '2024-08-15 14:06:06.459', '2024-08-15 14:06:06.459');
INSERT INTO public."UserRole" (id, "roleId", "userId", "createdAt", "updatedAt") VALUES ('clzvcsjng000mbcyfb3ph8zxq', 'gudang-keluar-view', 'clzvcsjng0005bcyfhgzy0954', '2024-08-15 14:06:06.459', '2024-08-15 14:06:06.459');
INSERT INTO public."UserRole" (id, "roleId", "userId", "createdAt", "updatedAt") VALUES ('clzvcsjng000nbcyfi5w82wf4', 'mutasi-view', 'clzvcsjng0005bcyfhgzy0954', '2024-08-15 14:06:06.459', '2024-08-15 14:06:06.459');
INSERT INTO public."UserRole" (id, "roleId", "userId", "createdAt", "updatedAt") VALUES ('clzvcsjng000obcyfbgix87sp', 'perbaikan-permintaan-view', 'clzvcsjng0005bcyfhgzy0954', '2024-08-15 14:06:06.459', '2024-08-15 14:06:06.459');
INSERT INTO public."UserRole" (id, "roleId", "userId", "createdAt", "updatedAt") VALUES ('clzvcsjng000pbcyfws9b689h', 'perbaikan-select-approve', 'clzvcsjng0005bcyfhgzy0954', '2024-08-15 14:06:06.459', '2024-08-15 14:06:06.459');
INSERT INTO public."UserRole" (id, "roleId", "userId", "createdAt", "updatedAt") VALUES ('clzvcsjng000qbcyfwgvjznhf', 'perbaikan-eksternal-view', 'clzvcsjng0005bcyfhgzy0954', '2024-08-15 14:06:06.459', '2024-08-15 14:06:06.459');
INSERT INTO public."UserRole" (id, "roleId", "userId", "createdAt", "updatedAt") VALUES ('clzvcsjng000rbcyfakvitoga', 'perbaikan-eksternal-komponen', 'clzvcsjng0005bcyfhgzy0954', '2024-08-15 14:06:06.459', '2024-08-15 14:06:06.459');
INSERT INTO public."UserRole" (id, "roleId", "userId", "createdAt", "updatedAt") VALUES ('clzvcsjng000sbcyf8swmoepu', 'perbaikan-eksternal-diserahkan-ke-vendor', 'clzvcsjng0005bcyfhgzy0954', '2024-08-15 14:06:06.459', '2024-08-15 14:06:06.459');
INSERT INTO public."UserRole" (id, "roleId", "userId", "createdAt", "updatedAt") VALUES ('clzvcsjng000tbcyf1m2k0466', 'perbaikan-eksternal-terima', 'clzvcsjng0005bcyfhgzy0954', '2024-08-15 14:06:06.459', '2024-08-15 14:06:06.459');
INSERT INTO public."UserRole" (id, "roleId", "userId", "createdAt", "updatedAt") VALUES ('clzvcsjng000ubcyfp5kmgcg1', 'perbaikan-eksternal-diserahkan-ke-user', 'clzvcsjng0005bcyfhgzy0954', '2024-08-15 14:06:06.459', '2024-08-15 14:06:06.459');
INSERT INTO public."UserRole" (id, "roleId", "userId", "createdAt", "updatedAt") VALUES ('clzvcsjng000vbcyf5oo0agry', 'peminjaman-internal-view', 'clzvcsjng0005bcyfhgzy0954', '2024-08-15 14:06:06.459', '2024-08-15 14:06:06.459');
INSERT INTO public."UserRole" (id, "roleId", "userId", "createdAt", "updatedAt") VALUES ('clzvcsjng000wbcyfhn87go4j', 'peminjaman-eksternal-view', 'clzvcsjng0005bcyfhgzy0954', '2024-08-15 14:06:06.459', '2024-08-15 14:06:06.459');
INSERT INTO public."UserRole" (id, "roleId", "userId", "createdAt", "updatedAt") VALUES ('clzvcsjng000xbcyfpbwam5no', 'master-view', 'clzvcsjng0005bcyfhgzy0954', '2024-08-15 14:06:06.459', '2024-08-15 14:06:06.459');
INSERT INTO public."UserRole" (id, "roleId", "userId", "createdAt", "updatedAt") VALUES ('clzvcsjng000ybcyffo40t0go', 'pengaturan-view', 'clzvcsjng0005bcyfhgzy0954', '2024-08-15 14:06:06.459', '2024-08-15 14:06:06.459');
INSERT INTO public."UserRole" (id, "roleId", "userId", "createdAt", "updatedAt") VALUES ('clzw67xtp00016mr21nmvnlzr', 'peminjaman-internal-approve', 'clzvcsjng0005bcyfhgzy0954', '2024-08-16 03:49:53.478', '2024-08-16 03:49:53.478');
INSERT INTO public."UserRole" (id, "roleId", "userId", "createdAt", "updatedAt") VALUES ('clzw67xtp00026mr22fvvfc44', 'peminjaman-internal-send-to-user', 'clzvcsjng0005bcyfhgzy0954', '2024-08-16 03:49:53.478', '2024-08-16 03:49:53.478');
INSERT INTO public."UserRole" (id, "roleId", "userId", "createdAt", "updatedAt") VALUES ('clzw67xtp00036mr2hdotywll', 'peminjaman-internal-receive-from-user', 'clzvcsjng0005bcyfhgzy0954', '2024-08-16 03:49:53.478', '2024-08-16 03:49:53.478');
INSERT INTO public."UserRole" (id, "roleId", "userId", "createdAt", "updatedAt") VALUES ('clzwpuu8z0001a1hun70lbbtg', 'peminjaman-eksternal-create', 'clzvcsjng0005bcyfhgzy0954', '2024-08-16 12:59:34.674', '2024-08-16 12:59:34.674');
INSERT INTO public."UserRole" (id, "roleId", "userId", "createdAt", "updatedAt") VALUES ('clzwpuu8z0002a1hu5ctsnm00', 'peminjaman-eksternal-approve', 'clzvcsjng0005bcyfhgzy0954', '2024-08-16 12:59:34.674', '2024-08-16 12:59:34.674');
INSERT INTO public."UserRole" (id, "roleId", "userId", "createdAt", "updatedAt") VALUES ('clzwpuu8z0003a1hueaptmdig', 'peminjaman-eksternal-send-to-user', 'clzvcsjng0005bcyfhgzy0954', '2024-08-16 12:59:34.674', '2024-08-16 12:59:34.674');
INSERT INTO public."UserRole" (id, "roleId", "userId", "createdAt", "updatedAt") VALUES ('clzwpuu8z0004a1huoj0d5dub', 'peminjaman-eksternal-receive-from-user', 'clzvcsjng0005bcyfhgzy0954', '2024-08-16 12:59:34.674', '2024-08-16 12:59:34.674');
INSERT INTO public."UserRole" (id, "roleId", "userId", "createdAt", "updatedAt") VALUES ('clzwrbmk7000ua1hu298p3441', 'peminjaman-eksternal-approve', '1', '2024-08-16 13:40:37.49', '2024-08-16 13:40:37.49');
INSERT INTO public."UserRole" (id, "roleId", "userId", "createdAt", "updatedAt") VALUES ('clzws76fx0010a1hujyxgwzgc', 'peminjaman-eksternal-view', 'clzws76fx000za1hu1rhx7qfp', '2024-08-16 14:05:09.596', '2024-08-16 14:05:09.596');
INSERT INTO public."UserRole" (id, "roleId", "userId", "createdAt", "updatedAt") VALUES ('clzws76fx0011a1hukbdcu3xm', 'peminjaman-eksternal-create', 'clzws76fx000za1hu1rhx7qfp', '2024-08-16 14:05:09.596', '2024-08-16 14:05:09.596');
INSERT INTO public."UserRole" (id, "roleId", "userId", "createdAt", "updatedAt") VALUES ('clzxn7wfe003usj3p41q3wmxd', 'evaluasi-read', 'clzxn7wfe003tsj3pwy2hrv8p', '2024-08-17 04:33:31.359', '2024-08-17 04:33:31.359');
INSERT INTO public."UserRole" (id, "roleId", "userId", "createdAt", "updatedAt") VALUES ('clzxn7wfe003vsj3p9pem50en', 'evaluasi-approve', 'clzxn7wfe003tsj3pwy2hrv8p', '2024-08-17 04:33:31.359', '2024-08-17 04:33:31.359');
INSERT INTO public."UserRole" (id, "roleId", "userId", "createdAt", "updatedAt") VALUES ('clzxn8fx8003ysj3pdss2baoj', 'evaluasi-read', 'clzxn8fx8003xsj3pvgufv45w', '2024-08-17 04:33:56.636', '2024-08-17 04:33:56.636');
INSERT INTO public."UserRole" (id, "roleId", "userId", "createdAt", "updatedAt") VALUES ('clzxn8fx8003zsj3px5u4e5t1', 'evaluasi-approve', 'clzxn8fx8003xsj3pvgufv45w', '2024-08-17 04:33:56.636', '2024-08-17 04:33:56.636');


--
-- PostgreSQL database dump complete
--

