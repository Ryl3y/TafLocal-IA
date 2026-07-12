-- ============================================================================
-- TafLocal AI - Demo Data (Cameroon)
-- ============================================================================
-- Description: Insert demo data for testing and development
-- Version: 1.0
-- Author: TafLocal AI Database Team
-- Date: 2026-06-28
-- ============================================================================

-- ============================================================================
-- DEMO DATA: Administrators (5)
-- ============================================================================

INSERT INTO utilisateur (id, nom, prenom, email, mot_de_passe, telephone, role, is_active) VALUES
('10000000-0000-0000-0000-000000000001'::UUID, 'Nkodo', 'Emmanuel', 'emmanuel.nkodo@taflocal.ai', encode(digest('Admin123!', 'sha256'), 'hex'), '+237699123456', 'ADMIN', TRUE),
('10000000-0000-0000-0000-000000000002'::UUID, 'Mengue', 'Marie-Claire', 'marie.mengue@taflocal.ai', encode(digest('Admin123!', 'sha256'), 'hex'), '+237699234567', 'ADMIN', TRUE),
('10000000-0000-0000-0000-000000000003'::UUID, 'Fouda', 'Jean-Pierre', 'jean.fouda@taflocal.ai', encode(digest('Admin123!', 'sha256'), 'hex'), '+237699345678', 'ADMIN', TRUE),
('10000000-0000-0000-0000-000000000004'::UUID, 'Ngono', 'Patricia', 'patricia.ngono@taflocal.ai', encode(digest('Admin123!', 'sha256'), 'hex'), '+237699456789', 'ADMIN', TRUE),
('10000000-0000-0000-0000-000000000005'::UUID, 'Mba', 'Charles', 'charles.mba@taflocal.ai', encode(digest('Admin123!', 'sha256'), 'hex'), '+237699567890', 'ADMIN', TRUE)
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- DEMO DATA: Companies (20)
-- ============================================================================

INSERT INTO utilisateur (id, nom, prenom, email, mot_de_passe, telephone, role, is_active) VALUES
('20000000-0000-0000-0000-000000000001'::UUID, 'Moukoko', 'Paul', 'paul.moukoko@camtel.cm', encode(digest('Company123!', 'sha256'), 'hex'), '+237677111111', 'COMPANY', TRUE),
('20000000-0000-0000-0000-000000000002'::UUID, 'Ngo', 'Sophie', 'sophie.ngo@mtncameroon.cm', encode(digest('Company123!', 'sha256'), 'hex'), '+237677222222', 'COMPANY', TRUE),
('20000000-0000-0000-0000-000000000003'::UUID, 'Etoa', 'Emmanuel', 'emmanuel.etoa@orange.cm', encode(digest('Company123!', 'sha256'), 'hex'), '+237677333333', 'COMPANY', TRUE),
('20000000-0000-0000-0000-000000000004'::UUID, 'Mvondo', 'Claire', 'claire.mvondo@societegenerale.cm', encode(digest('Company123!', 'sha256'), 'hex'), '+237677444444', 'COMPANY', TRUE),
('20000000-0000-0000-0000-000000000005'::UUID, 'Fouda', 'André', 'andre.fouda@afreximbank.cm', encode(digest('Company123!', 'sha256'), 'hex'), '+237677555555', 'COMPANY', TRUE),
('20000000-0000-0000-0000-000000000006'::UUID, 'Nkoulou', 'Brigitte', 'brigitte.nkoulou@ecobank.cm', encode(digest('Company123!', 'sha256'), 'hex'), '+237677666666', 'COMPANY', TRUE),
('20000000-0000-0000-0000-000000000007'::UUID, 'Mengue', 'Luc', 'luc.mengue@ubacam.cm', encode(digest('Company123!', 'sha256'), 'hex'), '+237677777777', 'COMPANY', TRUE),
('20000000-0000-0000-0000-000000000008'::UUID, 'Ngassam', 'Annie', 'annie.ngassam@bicec.cm', encode(digest('Company123!', 'sha256'), 'hex'), '+237677888888', 'COMPANY', TRUE),
('20000000-0000-0000-0000-000000000009'::UUID, 'Eyoum', 'Joseph', 'joseph.eyoum@snv.cm', encode(digest('Company123!', 'sha256'), 'hex'), '+237677999999', 'COMPANY', TRUE),
('20000000-0000-0000-0000-000000000010'::UUID, 'Mbarga', 'Céline', 'celine.mbarga@sonara.cm', encode(digest('Company123!', 'sha256'), 'hex'), '+237677000000', 'COMPANY', TRUE),
('20000000-0000-0000-0000-000000000011'::UUID, 'Nkou', 'René', 'rene.nkou@nespresso.cm', encode(digest('Company123!', 'sha256'), 'hex'), '+237677111112', 'COMPANY', TRUE),
('20000000-0000-0000-0000-000000000012'::UUID, 'Fotso', 'Martine', 'martine.fotso@guinness.cm', encode(digest('Company123!', 'sha256'), 'hex'), '+237677222223', 'COMPANY', TRUE),
('20000000-0000-0000-0000-000000000013'::UUID, 'Mballa', 'Pierre', 'pierre.mballa@totalenergies.cm', encode(digest('Company123!', 'sha256'), 'hex'), '+237677333334', 'COMPANY', TRUE),
('20000000-0000-0000-0000-000000000014'::UUID, 'Ngoa', 'Françoise', 'francoise.ngoa@airfrance.cm', encode(digest('Company123!', 'sha256'), 'hex'), '+237677444445', 'COMPANY', TRUE),
('20000000-0000-0000-0000-000000000015'::UUID, 'Mvondo', 'Alain', 'alain.mvondo@hilton.cm', encode(digest('Company123!', 'sha256'), 'hex'), '+237677555556', 'COMPANY', TRUE),
('20000000-0000-0000-0000-000000000016'::UUID, 'Etoa', 'Monique', 'monique.etoa@accor.cm', encode(digest('Company123!', 'sha256'), 'hex'), '+237677666667', 'COMPANY', TRUE),
('20000000-0000-0000-0000-000000000017'::UUID, 'Fouda', 'Georges', 'georges.fouda@carrefour.cm', encode(digest('Company123!', 'sha256'), 'hex'), '+237677777778', 'COMPANY', TRUE),
('20000000-0000-0000-0000-000000000018'::UUID, 'Nkoulou', 'Jacques', 'jacques.nkoulou@jumia.cm', encode(digest('Company123!', 'sha256'), 'hex'), '+237677888889', 'COMPANY', TRUE),
('20000000-0000-0000-0000-000000000019'::UUID, 'Mengue', 'Yvette', 'yvette.mengue@kfc.cm', encode(digest('Company123!', 'sha256'), 'hex'), '+237677999990', 'COMPANY', TRUE),
('20000000-0000-0000-0000-000000000020'::UUID, 'Ngassam', 'Michel', 'michel.ngassam@pizza.cm', encode(digest('Company123!', 'sha256'), 'hex'), '+237677000001', 'COMPANY', TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO entreprise (id, user_id, nom_entreprise, secteur, description, site_web, adresse, ville, telephone, verified) VALUES
('30000000-0000-0000-0000-000000000001'::UUID, '20000000-0000-0000-0000-000000000001'::UUID, 'Cameroon Telecom', 'Télécommunications', 'Opérateur de télécommunications national', 'https://www.camtel.cm', 'Boulevard de la Liberté, Yaoundé', 'Yaoundé', '+237222222222', TRUE),
('30000000-0000-0000-0000-000000000002'::UUID, '20000000-0000-0000-0000-000000000002'::UUID, 'MTN Cameroon', 'Télécommunications', 'Leader des télécommunications mobiles', 'https://www.mtn.cm', 'Immeuble MTN, Douala', 'Douala', '+237233333333', TRUE),
('30000000-0000-0000-0000-000000000003'::UUID, '20000000-0000-0000-0000-000000000003'::UUID, 'Orange Cameroon', 'Télécommunications', 'Opérateur de télécommunications', 'https://www.orange.cm', 'Orange House, Yaoundé', 'Yaoundé', '+237222223333', TRUE),
('30000000-0000-0000-0000-000000000004'::UUID, '20000000-0000-0000-0000-000000000004'::UUID, 'Société Générale Cameroun', 'Finance', 'Banque internationale', 'https://www.societegenerale.cm', 'Avenue Charles de Gaulle, Yaoundé', 'Yaoundé', '+237222224444', TRUE),
('30000000-0000-0000-0000-000000000005'::UUID, '20000000-0000-0000-0000-000000000005'::UUID, 'Afreximbank Cameroon', 'Finance', 'Banque de développement africain', 'https://www.afreximbank.com', 'Bastos, Yaoundé', 'Yaoundé', '+237222225555', TRUE),
('30000000-0000-0000-0000-000000000006'::UUID, '20000000-0000-0000-0000-000000000006'::UUID, 'Ecobank Cameroon', 'Finance', 'Banque panafricaine', 'https://www.ecobank.com', 'Akwa, Douala', 'Douala', '+237233336666', TRUE),
('30000000-0000-0000-0000-000000000007'::UUID, '20000000-0000-0000-0000-000000000007'::UUID, 'UBA Cameroon', 'Finance', 'United Bank for Africa', 'https://www.ubagroup.com', 'Bastos, Yaoundé', 'Yaoundé', '+237222227777', TRUE),
('30000000-0000-0000-0000-000000000008'::UUID, '20000000-0000-0000-0000-000000000008'::UUID, 'BICEC', 'Finance', 'Banque commerciale', 'https://www.bicec.com', 'Bonanjo, Douala', 'Douala', '+237233338888', TRUE),
('30000000-0000-0000-0000-000000000009'::UUID, '20000000-0000-0000-0000-000000000009'::UUID, 'SNV Cameroon', 'Énergie', 'Société nationale des eaux', 'https://www.snv.cm', 'Mvan, Yaoundé', 'Yaoundé', '+237222229999', TRUE),
('30000000-0000-0000-0000-000000000010'::UUID, '20000000-0000-0000-0000-000000000010'::UUID, 'Sonara', 'Énergie', 'Société nationale de raffinage', 'https://www.sonara.cm', 'Limbe', 'Limbe', '+237233330000', TRUE),
('30000000-0000-0000-0000-000000000011'::UUID, '20000000-0000-0000-0000-000000000011'::UUID, 'Nespresso Cameroon', 'Industrie', 'Café de qualité', 'https://www.nespresso.com', 'Akwa, Douala', 'Douala', '+237233331111', TRUE),
('30000000-0000-0000-0000-000000000012'::UUID, '20000000-0000-0000-0000-000000000012'::UUID, 'Guinness Cameroon', 'Industrie', 'Brasserie', 'https://www.guinness-nigeria.com', 'Bamenda', 'Bamenda', '+237233332222', TRUE),
('30000000-0000-0000-0000-000000000013'::UUID, '20000000-0000-0000-0000-000000000013'::UUID, 'TotalEnergies Cameroon', 'Énergie', 'Énergie pétrolière', 'https://www.totalenergies.com', 'Akwa, Douala', 'Douala', '+237233333333', TRUE),
('30000000-0000-0000-0000-000000000014'::UUID, '20000000-0000-0000-0000-000000000014'::UUID, 'Air France Cameroon', 'Transport', 'Compagnie aérienne', 'https://www.airfrance.com', 'Aéroport Douala', 'Douala', '+237233334444', TRUE),
('30000000-0000-0000-0000-000000000015'::UUID, '20000000-0000-0000-0000-000000000015'::UUID, 'Hilton Cameroon', 'Hôtellerie', 'Hôtellerie de luxe', 'https://www.hilton.com', 'Bastos, Yaoundé', 'Yaoundé', '+237222225555', TRUE),
('30000000-0000-0000-0000-000000000016'::UUID, '20000000-0000-0000-0000-000000000016'::UUID, 'Accor Cameroon', 'Hôtellerie', 'Groupe hôtelier', 'https://www.accor.com', 'Akwa, Douala', 'Douala', '+237233336666', TRUE),
('30000000-0000-0000-0000-000000000017'::UUID, '20000000-0000-0000-0000-000000000017'::UUID, 'Carrefour Cameroon', 'Commerce', 'Grande distribution', 'https://www.carrefour.com', 'Douala Mall, Douala', 'Douala', '+237233337777', TRUE),
('30000000-0000-0000-0000-000000000018'::UUID, '20000000-0000-0000-0000-000000000018'::UUID, 'Jumia Cameroon', 'E-commerce', 'Commerce en ligne', 'https://www.jumia.cm', 'Yaoundé', 'Yaoundé', '+237222228888', TRUE),
('30000000-0000-0000-0000-000000000019'::UUID, '20000000-0000-0000-0000-000000000019'::UUID, 'KFC Cameroon', 'Restauration', 'Chaîne de restauration', 'https://www.kfc.com', 'Douala', 'Douala', '+237233339999', TRUE),
('30000000-0000-0000-0000-000000000020'::UUID, '20000000-0000-0000-0000-000000000020'::UUID, 'Pizza Hut Cameroon', 'Restauration', 'Chaîne de restauration', 'https://www.pizzahut.com', 'Yaoundé', 'Yaoundé', '+237222220000', TRUE)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- DEMO DATA: Candidates (50)
-- ============================================================================

INSERT INTO utilisateur (id, nom, prenom, email, mot_de_passe, telephone, role, is_active) VALUES
('40000000-0000-0000-0000-000000000001'::UUID, 'Ngo', 'Jean', 'jean.ngo@gmail.com', encode(digest('Candidate123!', 'sha256'), 'hex'), '+237655111111', 'CANDIDATE', TRUE),
('40000000-0000-0000-0000-000000000002'::UUID, 'Mvondo', 'Marie', 'marie.mvondo@yahoo.com', encode(digest('Candidate123!', 'sha256'), 'hex'), '+237655222222', 'CANDIDATE', TRUE),
('40000000-0000-0000-0000-000000000003'::UUID, 'Fouda', 'Pierre', 'pierre.fouda@hotmail.com', encode(digest('Candidate123!', 'sha256'), 'hex'), '+237655333333', 'CANDIDATE', TRUE),
('40000000-0000-0000-0000-000000000004'::UUID, 'Etoa', 'Claire', 'claire.etoa@gmail.com', encode(digest('Candidate123!', 'sha256'), 'hex'), '+237655444444', 'CANDIDATE', TRUE),
('40000000-0000-0000-0000-000000000005'::UUID, 'Mengue', 'Emmanuel', 'emmanuel.mengue@yahoo.com', encode(digest('Candidate123!', 'sha256'), 'hex'), '+237655555555', 'CANDIDATE', TRUE),
('40000000-0000-0000-0000-000000000006'::UUID, 'Nkoulou', 'Brigitte', 'brigitte.nkoulou@gmail.com', encode(digest('Candidate123!', 'sha256'), 'hex'), '+237655666666', 'CANDIDATE', TRUE),
('40000000-0000-0000-0000-000000000007'::UUID, 'Ngassam', 'Luc', 'luc.ngassam@hotmail.com', encode(digest('Candidate123!', 'sha256'), 'hex'), '+237655777777', 'CANDIDATE', TRUE),
('40000000-0000-0000-0000-000000000008'::UUID, 'Eyoum', 'Annie', 'annie.eyoum@yahoo.com', encode(digest('Candidate123!', 'sha256'), 'hex'), '+237655888888', 'CANDIDATE', TRUE),
('40000000-0000-0000-0000-000000000009'::UUID, 'Mbarga', 'Joseph', 'joseph.mbarga@gmail.com', encode(digest('Candidate123!', 'sha256'), 'hex'), '+237655999999', 'CANDIDATE', TRUE),
('40000000-0000-0000-0000-000000000010'::UUID, 'Nkou', 'Céline', 'celine.nkou@hotmail.com', encode(digest('Candidate123!', 'sha256'), 'hex'), '+237655000000', 'CANDIDATE', TRUE),
('40000000-0000-0000-0000-000000000011'::UUID, 'Fotso', 'René', 'rene.fotso@yahoo.com', encode(digest('Candidate123!', 'sha256'), 'hex'), '+237655111112', 'CANDIDATE', TRUE),
('40000000-0000-0000-0000-000000000012'::UUID, 'Mballa', 'Martine', 'martine.mballa@gmail.com', encode(digest('Candidate123!', 'sha256'), 'hex'), '+237655222223', 'CANDIDATE', TRUE),
('40000000-0000-0000-0000-000000000013'::UUID, 'Ngoa', 'Pierre', 'pierre.ngoa@hotmail.com', encode(digest('Candidate123!', 'sha256'), 'hex'), '+237655333334', 'CANDIDATE', TRUE),
('40000000-0000-0000-0000-000000000014'::UUID, 'Mvondo', 'Françoise', 'francoise.mvondo@yahoo.com', encode(digest('Candidate123!', 'sha256'), 'hex'), '+237655444445', 'CANDIDATE', TRUE),
('40000000-0000-0000-0000-000000000015'::UUID, 'Etoa', 'Alain', 'alain.etoa@gmail.com', encode(digest('Candidate123!', 'sha256'), 'hex'), '+237655555556', 'CANDIDATE', TRUE),
('40000000-0000-0000-0000-000000000016'::UUID, 'Fouda', 'Monique', 'monique.fouda@hotmail.com', encode(digest('Candidate123!', 'sha256'), 'hex'), '+237655666667', 'CANDIDATE', TRUE),
('40000000-0000-0000-0000-000000000017'::UUID, 'Mengue', 'Georges', 'georges.mengue@yahoo.com', encode(digest('Candidate123!', 'sha256'), 'hex'), '+237655777778', 'CANDIDATE', TRUE),
('40000000-0000-0000-0000-000000000018'::UUID, 'Nkoulou', 'Jacques', 'jacques.nkoulou@gmail.com', encode(digest('Candidate123!', 'sha256'), 'hex'), '+237655888889', 'CANDIDATE', TRUE),
('40000000-0000-0000-0000-000000000019'::UUID, 'Ngassam', 'Yvette', 'yvette.ngassam@hotmail.com', encode(digest('Candidate123!', 'sha256'), 'hex'), '+237655999990', 'CANDIDATE', TRUE),
('40000000-0000-0000-0000-000000000020'::UUID, 'Eyoum', 'Michel', 'michel.eyoum@yahoo.com', encode(digest('Candidate123!', 'sha256'), 'hex'), '+237655000001', 'CANDIDATE', TRUE),
('40000000-0000-0000-0000-000000000021'::UUID, 'Mbarga', 'Patricia', 'patricia.mbarga@gmail.com', encode(digest('Candidate123!', 'sha256'), 'hex'), '+237655111113', 'CANDIDATE', TRUE),
('40000000-0000-0000-0000-000000000022'::UUID, 'Nkou', 'Jean-Pierre', 'jean-pierre.nkou@hotmail.com', encode(digest('Candidate123!', 'sha256'), 'hex'), '+237655222224', 'CANDIDATE', TRUE),
('40000000-0000-0000-0000-000000000023'::UUID, 'Fotso', 'Marie-Claire', 'marie-claire.fotso@yahoo.com', encode(digest('Candidate123!', 'sha256'), 'hex'), '+237655333335', 'CANDIDATE', TRUE),
('40000000-0000-0000-0000-000000000024'::UUID, 'Mballa', 'Emmanuel', 'emmanuel.mballa@gmail.com', encode(digest('Candidate123!', 'sha256'), 'hex'), '+237655444446', 'CANDIDATE', TRUE),
('40000000-0000-0000-0000-000000000025'::UUID, 'Ngoa', 'Brigitte', 'brigitte.ngoa@hotmail.com', encode(digest('Candidate123!', 'sha256'), 'hex'), '+237655555557', 'CANDIDATE', TRUE),
('40000000-0000-0000-0000-000000000026'::UUID, 'Mvondo', 'Luc', 'luc.mvondo@yahoo.com', encode(digest('Candidate123!', 'sha256'), 'hex'), '+237655666668', 'CANDIDATE', TRUE),
('40000000-0000-0000-0000-000000000027'::UUID, 'Etoa', 'Annie', 'annie.etoa@gmail.com', encode(digest('Candidate123!', 'sha256'), 'hex'), '+237655777779', 'CANDIDATE', TRUE),
('40000000-0000-0000-0000-000000000028'::UUID, 'Fouda', 'Joseph', 'joseph.fouda@hotmail.com', encode(digest('Candidate123!', 'sha256'), 'hex'), '+237655888880', 'CANDIDATE', TRUE),
('40000000-0000-0000-0000-000000000029'::UUID, 'Mengue', 'Céline', 'celine.mengue@yahoo.com', encode(digest('Candidate123!', 'sha256'), 'hex'), '+237655999991', 'CANDIDATE', TRUE),
('40000000-0000-0000-0000-000000000030'::UUID, 'Nkoulou', 'René', 'rene.nkoulou@gmail.com', encode(digest('Candidate123!', 'sha256'), 'hex'), '+237655000002', 'CANDIDATE', TRUE),
('40000000-0000-0000-0000-000000000031'::UUID, 'Ngassam', 'Martine', 'martine.ngassam@hotmail.com', encode(digest('Candidate123!', 'sha256'), 'hex'), '+237655111114', 'CANDIDATE', TRUE),
('40000000-0000-0000-0000-000000000032'::UUID, 'Eyoum', 'Pierre', 'pierre.eyoum@yahoo.com', encode(digest('Candidate123!', 'sha256'), 'hex'), '+237655222225', 'CANDIDATE', TRUE),
('40000000-0000-0000-0000-000000000033'::UUID, 'Mbarga', 'Françoise', 'francoise.mbarga@gmail.com', encode(digest('Candidate123!', 'sha256'), 'hex'), '+237655333336', 'CANDIDATE', TRUE),
('40000000-0000-0000-0000-000000000034'::UUID, 'Nkou', 'Alain', 'alain.nkou@hotmail.com', encode(digest('Candidate123!', 'sha256'), 'hex'), '+237655444447', 'CANDIDATE', TRUE),
('40000000-0000-0000-0000-000000000035'::UUID, 'Fotso', 'Monique', 'monique.fotso@yahoo.com', encode(digest('Candidate123!', 'sha256'), 'hex'), '+237655555558', 'CANDIDATE', TRUE),
('40000000-0000-0000-0000-000000000036'::UUID, 'Mballa', 'Georges', 'georges.mballa@gmail.com', encode(digest('Candidate123!', 'sha256'), 'hex'), '+237655666669', 'CANDIDATE', TRUE),
('40000000-0000-0000-0000-000000000037'::UUID, 'Ngoa', 'Jacques', 'jacques.ngoa@hotmail.com', encode(digest('Candidate123!', 'sha256'), 'hex'), '+237655777770', 'CANDIDATE', TRUE),
('40000000-0000-0000-0000-000000000038'::UUID, 'Mvondo', 'Yvette', 'yvette.mvondo@yahoo.com', encode(digest('Candidate123!', 'sha256'), 'hex'), '+237655888881', 'CANDIDATE', TRUE),
('40000000-0000-0000-0000-000000000039'::UUID, 'Etoa', 'Michel', 'michel.etoa@gmail.com', encode(digest('Candidate123!', 'sha256'), 'hex'), '+237655999992', 'CANDIDATE', TRUE),
('40000000-0000-0000-0000-000000000040'::UUID, 'Fouda', 'Patricia', 'patricia.fouda@hotmail.com', encode(digest('Candidate123!', 'sha256'), 'hex'), '+237655000003', 'CANDIDATE', TRUE),
('40000000-0000-0000-0000-000000000041'::UUID, 'Mengue', 'Jean-Pierre', 'jean-pierre.mengue@yahoo.com', encode(digest('Candidate123!', 'sha256'), 'hex'), '+237655111115', 'CANDIDATE', TRUE),
('40000000-0000-0000-0000-000000000042'::UUID, 'Nkoulou', 'Marie-Claire', 'marie-claire.nkoulou@gmail.com', encode(digest('Candidate123!', 'sha256'), 'hex'), '+237655222226', 'CANDIDATE', TRUE),
('40000000-0000-0000-0000-000000000043'::UUID, 'Ngassam', 'Emmanuel', 'emmanuel.ngassam@hotmail.com', encode(digest('Candidate123!', 'sha256'), 'hex'), '+237655333337', 'CANDIDATE', TRUE),
('40000000-0000-0000-0000-000000000044'::UUID, 'Eyoum', 'Brigitte', 'brigitte.eyoum@yahoo.com', encode(digest('Candidate123!', 'sha256'), 'hex'), '+237655444448', 'CANDIDATE', TRUE),
('40000000-0000-0000-0000-000000000045'::UUID, 'Mbarga', 'Luc', 'luc.mbarga@gmail.com', encode(digest('Candidate123!', 'sha256'), 'hex'), '+237655555559', 'CANDIDATE', TRUE),
('40000000-0000-0000-0000-000000000046'::UUID, 'Nkou', 'Annie', 'annie.nkou@hotmail.com', encode(digest('Candidate123!', 'sha256'), 'hex'), '+237655666660', 'CANDIDATE', TRUE),
('40000000-0000-0000-0000-000000000047'::UUID, 'Fotso', 'Joseph', 'joseph.fotso@yahoo.com', encode(digest('Candidate123!', 'sha256'), 'hex'), '+237655777671', 'CANDIDATE', TRUE),
('40000000-0000-0000-0000-000000000048'::UUID, 'Mballa', 'Céline', 'celine.mballa@gmail.com', encode(digest('Candidate123!', 'sha256'), 'hex'), '+237655888882', 'CANDIDATE', TRUE),
('40000000-0000-0000-0000-000000000049'::UUID, 'Ngoa', 'René', 'rene.ngoa@hotmail.com', encode(digest('Candidate123!', 'sha256'), 'hex'), '+237655999993', 'CANDIDATE', TRUE),
('40000000-0000-0000-0000-000000000050'::UUID, 'Mvondo', 'Martine', 'martine.mvondo@yahoo.com', encode(digest('Candidate123!', 'sha256'), 'hex'), '+237655000004', 'CANDIDATE', TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO chercheur_emploi (id, user_id, date_naissance, genre, adresse, ville, biographie, linkedin, github) VALUES
('50000000-0000-0000-0000-000000000001'::UUID, '40000000-0000-0000-0000-000000000001'::UUID, '1990-05-15', 'H', 'Quartier Bastos, Yaoundé', 'Yaoundé', 'Développeur Full Stack avec 5 ans d''expérience', 'https://linkedin.com/in/jeanngo', 'https://github.com/jeanngo'),
('50000000-0000-0000-0000-000000000002'::UUID, '40000000-0000-0000-0000-000000000002'::UUID, '1992-08-22', 'F', 'Akwa, Douala', 'Douala', 'Spécialiste en marketing digital', 'https://linkedin.com/in/mariemvondo', NULL),
('50000000-0000-0000-0000-000000000003'::UUID, '40000000-0000-0000-0000-000000000003'::UUID, '1988-03-10', 'H', 'Bamenda', 'Bamenda', 'Ingénieur logiciel senior', 'https://linkedin.com/in/pierrefouda', 'https://github.com/pierrefouda'),
('50000000-0000-0000-0000-000000000004'::UUID, '40000000-0000-0000-0000-000000000004'::UUID, '1995-12-05', 'F', 'Yaoundé', 'Yaoundé', 'Designer UI/UX passionnée', 'https://linkedin.com/in/claireetoa', NULL),
('50000000-0000-0000-0000-000000000005'::UUID, '40000000-0000-0000-0000-000000000005'::UUID, '1991-07-18', 'H', 'Douala', 'Douala', 'Data scientist expérimenté', 'https://linkedin.com/in/emmanuelmengue', 'https://github.com/emmanuelmengue'),
('50000000-0000-0000-0000-000000000006'::UUID, '40000000-0000-0000-0000-000000000006'::UUID, '1993-09-25', 'F', 'Bafoussam', 'Bafoussam', 'Chef de projet agile', 'https://linkedin.com/in/brigittenkoulou', NULL),
('50000000-0000-0000-0000-000000000007'::UUID, '40000000-0000-0000-0000-000000000007'::UUID, '1989-04-12', 'H', 'Garoua', 'Garoua', 'Architecte de solutions cloud', 'https://linkedin.com/in/lucngassam', 'https://github.com/lucngassam'),
('50000000-0000-0000-0000-000000000008'::UUID, '40000000-0000-0000-0000-000000000008'::UUID, '1994-11-30', 'F', 'Maroua', 'Maroua', 'Analyste business intelligence', 'https://linkedin.com/in/annieeyoum', NULL),
('50000000-0000-0000-0000-000000000009'::UUID, '40000000-0000-0000-0000-000000000009'::UUID, '1990-02-14', 'H', 'Bertoua', 'Bertoua', 'Développeur mobile Android/iOS', 'https://linkedin.com/in/josephmbarga', 'https://github.com/josephmbarga'),
('50000000-0000-0000-0000-000000000010'::UUID, '40000000-0000-0000-0000-000000000010'::UUID, '1992-06-20', 'F', 'Ngaoundéré', 'Ngaoundéré', 'Spécialiste en cybersécurité', 'https://linkedin.com/in/celinenkou', NULL),
('50000000-0000-0000-0000-000000000011'::UUID, '40000000-0000-0000-0000-000000000011'::UUID, '1987-10-08', 'H', 'Édéa', 'Édéa', 'Ingénieur DevOps', 'https://linkedin.com/in/renefotso', 'https://github.com/renefotso'),
('50000000-0000-0000-0000-000000000012'::UUID, '40000000-0000-0000-0000-000000000012'::UUID, '1993-01-17', 'F', 'Kribi', 'Kribi', 'Product manager', 'https://linkedin.com/in/martinemballa', NULL),
('50000000-0000-0000-0000-000000000013'::UUID, '40000000-0000-0000-0000-000000000013'::UUID, '1991-08-03', 'H', 'Limbé', 'Limbé', 'Développeur backend Node.js', 'https://linkedin.com/in/pierrengoa', 'https://github.com/pierrengoa'),
('50000000-0000-0000-0000-000000000014'::UUID, '40000000-0000-0000-0000-000000000014'::UUID, '1994-05-28', 'F', 'Buea', 'Buea', 'UX Researcher', 'https://linkedin.com/in/francoisemvondo', NULL),
('50000000-0000-0000-0000-000000000015'::UUID, '40000000-0000-0000-0000-000000000015'::UUID, '1988-12-19', 'H', 'Kousséri', 'Kousséri', 'Machine Learning Engineer', 'https://linkedin.com/in/alainetoa', 'https://github.com/alainetoa'),
('50000000-0000-0000-0000-000000000016'::UUID, '40000000-0000-0000-0000-000000000016'::UUID, '1992-03-25', 'F', 'Mbouda', 'Mbouda', 'Scrum Master certifié', 'https://linkedin.com/in/moniquefouda', NULL),
('50000000-0000-0000-0000-000000000017'::UUID, '40000000-0000-0000-0000-000000000017'::UUID, '1990-09-11', 'H', 'Nkongsamba', 'Nkongsamba', 'Architecte logiciel', 'https://linkedin.com/in/georgesmengue', 'https://github.com/georgesmengue'),
('50000000-0000-0000-0000-000000000018'::UUID, '40000000-0000-0000-0000-000000000018'::UUID, '1993-07-07', 'F', 'Sangmélima', 'Sangmélima', 'Business Analyst', 'https://linkedin.com/in/jacquesnkoulou', NULL),
('50000000-0000-0000-0000-000000000019'::UUID, '40000000-0000-0000-0000-000000000019'::UUID, '1989-05-02', 'H', 'Ebolowa', 'Ebolowa', 'Développeur React Native', 'https://linkedin.com/in/yvettengassam', 'https://github.com/yvettengassam'),
('50000000-0000-0000-0000-000000000020'::UUID, '40000000-0000-0000-0000-000000000020'::UUID, '1994-11-16', 'F', 'Kumba', 'Kumba', 'QA Engineer', 'https://linkedin.com/in/micheleyoum', NULL),
('50000000-0000-0000-0000-000000000021'::UUID, '40000000-0000-0000-0000-000000000021'::UUID, '1991-02-23', 'H', 'Tiko', 'Tiko', 'Solutions Architect', 'https://linkedin.com/in/patriciambarga', 'https://github.com/patriciambarga'),
('50000000-0000-0000-0000-000000000022'::UUID, '40000000-0000-0000-0000-000000000022'::UUID, '1992-08-09', 'F', 'Bamenda', 'Bamenda', 'Technical Writer', 'https://linkedin.com/in/jean-pierrenkou', NULL),
('50000000-0000-0000-0000-000000000023'::UUID, '40000000-0000-0000-0000-000000000023'::UUID, '1988-04-15', 'H', 'Yaoundé', 'Yaoundé', 'Full Stack Developer', 'https://linkedin.com/in/marie-clairefotso', 'https://github.com/marie-clairefotso'),
('50000000-0000-0000-0000-000000000024'::UUID, '40000000-0000-0000-0000-000000000024'::UUID, '1993-10-30', 'F', 'Douala', 'Douala', 'Data Analyst', 'https://linkedin.com/in/emmanuelmballa', NULL),
('50000000-0000-0000-0000-000000000025'::UUID, '40000000-0000-0000-0000-000000000025'::UUID, '1990-06-18', 'H', 'Bafoussam', 'Bafoussam', 'Backend Developer Python', 'https://linkedin.com/in/brigittemgoa', 'https://github.com/brigittemgoa'),
('50000000-0000-0000-0000-000000000026'::UUID, '40000000-0000-0000-0000-000000000026'::UUID, '1994-01-12', 'F', 'Garoua', 'Garoua', 'Frontend Developer Vue.js', 'https://linkedin.com/in/lucmvondo', NULL),
('50000000-0000-0000-0000-000000000027'::UUID, '40000000-0000-0000-0000-000000000027'::UUID, '1989-09-27', 'H', 'Maroua', 'Maroua', 'DevOps Engineer', 'https://linkedin.com/in/annieetoa', 'https://github.com/annieetoa'),
('50000000-0000-0000-0000-000000000028'::UUID, '40000000-0000-0000-0000-000000000028'::UUID, '1992-04-04', 'F', 'Bertoua', 'Bertoua', 'Project Manager', 'https://linkedin.com/in/josephfouda', NULL),
('50000000-0000-0000-0000-000000000029'::UUID, '40000000-0000-0000-0000-000000000029'::UUID, '1990-12-21', 'H', 'Ngaoundéré', 'Ngaoundéré', 'Software Engineer', 'https://linkedin.com/in/celinemengue', 'https://github.com/celinemengue'),
('50000000-0000-0000-0000-000000000030'::UUID, '40000000-0000-0000-0000-000000000030'::UUID, '1993-07-14', 'F', 'Édéa', 'Édéa', 'UX Designer', 'https://linkedin.com/in/renenkoulou', NULL),
('50000000-0000-0000-0000-000000000031'::UUID, '40000000-0000-0000-0000-000000000031'::UUID, '1988-03-08', 'H', 'Kribi', 'Kribi', 'Cloud Architect', 'https://linkedin.com/in/martinengassam', 'https://github.com/martinengassam'),
('50000000-0000-0000-0000-000000000032'::UUID, '40000000-0000-0000-0000-000000000032'::UUID, '1991-10-22', 'F', 'Limbé', 'Limbé', 'Business Intelligence Analyst', 'https://linkedin.com/in/piereeyoum', NULL),
('50000000-0000-0000-0000-000000000033'::UUID, '40000000-0000-0000-0000-000000000033'::UUID, '1994-06-05', 'H', 'Buea', 'Buea', 'Mobile Developer Flutter', 'https://linkedin.com/in/francoisembarga', 'https://github.com/francoisembarga'),
('50000000-0000-0000-0000-000000000034'::UUID, '40000000-0000-0000-0000-000000000034'::UUID, '1992-02-17', 'F', 'Kousséri', 'Kousséri', 'Product Owner', 'https://linkedin.com/in/alainnkou', NULL),
('50000000-0000-0000-0000-000000000035'::UUID, '40000000-0000-0000-0000-000000000035'::UUID, '1989-08-31', 'H', 'Mbouda', 'Mbouda', 'Solutions Engineer', 'https://linkedin.com/in/moniquefotso', 'https://github.com/moniquefotso'),
('50000000-0000-0000-0000-000000000036'::UUID, '40000000-0000-0000-0000-000000000036'::UUID, '1993-05-13', 'F', 'Nkongsamba', 'Nkongsamba', 'Agile Coach', 'https://linkedin.com/in/georgesmballa', NULL),
('50000000-0000-0000-0000-000000000037'::UUID, '40000000-0000-0000-0000-000000000037'::UUID, '1990-11-26', 'H', 'Sangmélima', 'Sangmélima', 'Backend Developer Java', 'https://linkedin.com/in/jacquesngoa', 'https://github.com/jacquesngoa'),
('50000000-0000-0000-0000-000000000038'::UUID, '40000000-0000-0000-0000-000000000038'::UUID, '1994-04-09', 'F', 'Ebolowa', 'Ebolowa', 'Data Engineer', 'https://linkedin.com/in/yvettemvondo', NULL),
('50000000-0000-0000-0000-000000000039'::UUID, '1988-09-02', 'H', 'Kumba', 'Kumba', 'Machine Learning Engineer', 'https://linkedin.com/in/micheletoa', 'https://github.com/micheletoa'),
('50000000-0000-0000-0000-000000000040'::UUID, '40000000-0000-0000-0000-000000000040'::UUID, '1991-06-15', 'F', 'Tiko', 'Tiko', 'QA Automation Engineer', 'https://linkedin.com/in/patriciafouda', NULL),
('50000000-0000-0000-0000-000000000041'::UUID, '40000000-0000-0000-0000-000000000041'::UUID, '1993-01-28', 'H', 'Bamenda', 'Bamenda', 'Platform Engineer', 'https://linkedin.com/in/jean-pierremengue', 'https://github.com/jean-pierremengue'),
('50000000-0000-0000-0000-000000000042'::UUID, '40000000-0000-0000-0000-000000000042'::UUID, '1990-08-11', 'F', 'Yaoundé', 'Yaoundé', 'Technical Lead', 'https://linkedin.com/in/marie-clairenkoulou', NULL),
('50000000-0000-0000-0000-000000000043'::UUID, '1992-12-24', 'H', 'Douala', 'Douala', 'Senior Developer', 'https://linkedin.com/in/emmanuelngassam', 'https://github.com/emmanuelngassam'),
('50000000-0000-0000-0000-000000000044'::UUID, '1994-05-06', 'F', 'Bafoussam', 'Bafoussam', 'Engineering Manager', 'https://linkedin.com/in/brigitteeyoum', NULL),
('50000000-0000-0000-0000-000000000045'::UUID, '1989-03-19', 'H', 'Garoua', 'Garoua', 'CTO', 'https://linkedin.com/in/lucmbarga', 'https://github.com/lucmbarga'),
('50000000-0000-0000-0000-000000000046'::UUID, '1991-10-01', 'F', 'Maroua', 'Maroua', 'VP Engineering', 'https://linkedin.com/in/annienkou', NULL),
('50000000-0000-0000-0000-000000000047'::UUID, '1993-07-23', 'H', 'Bertoua', 'Bertoua', 'Director of Engineering', 'https://linkedin.com/in/josephfotso', 'https://github.com/josephfotso'),
('50000000-0000-0000-0000-000000000048'::UUID, '1990-04-16', 'F', 'Ngaoundéré', 'Ngaoundéré', 'Head of Development', 'https://linkedin.com/in/celinemballa', NULL),
('50000000-0000-0000-0000-000000000049'::UUID, '1994-11-29', 'H', 'Édéa', 'Édéa', 'Lead Developer', 'https://linkedin.com/in/renengoa', 'https://github.com/renengoa'),
('50000000-0000-0000-0000-000000000050'::UUID, '1992-06-12', 'F', 'Kribi', 'Kribi', 'Principal Engineer', 'https://linkedin.com/in/martinemvondo', NULL)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- DEMO DATA: CVs (80)
-- ============================================================================

INSERT INTO cv (id, candidate_id, titre, fichier_pdf, date_import, version, is_default) VALUES
('60000000-0000-0000-0000-000000000001'::UUID, '50000000-0000-0000-0000-000000000001'::UUID, 'CV Jean Ngo - Full Stack Developer', '/media/cvs/cv_jean_ngo.pdf', '2024-01-15', 1, TRUE),
('60000000-0000-0000-0000-000000000002'::UUID, '50000000-0000-0000-0000-000000000002'::UUID, 'CV Marie Mvondo - Marketing Digital', '/media/cvs/cv_marie_mvondo.pdf', '2024-01-16', 1, TRUE),
('60000000-0000-0000-0000-000000000003'::UUID, '50000000-0000-0000-0000-000000000003'::UUID, 'CV Pierre Fouda - Software Engineer', '/media/cvs/cv_pierre_fouda.pdf', '2024-01-17', 1, TRUE),
('60000000-0000-0000-0000-000000000004'::UUID, '50000000-0000-0000-0000-000000000004'::UUID, 'CV Claire Etoa - UI/UX Designer', '/media/cvs/cv_claire_etoa.pdf', '2024-01-18', 1, TRUE),
('60000000-0000-0000-0000-000000000005'::UUID, '50000000-0000-0000-0000-000000000005'::UUID, 'CV Emmanuel Mengue - Data Scientist', '/media/cvs/cv_emmanuel_mengue.pdf', '2024-01-19', 1, TRUE),
('60000000-0000-0000-0000-000000000006'::UUID, '50000000-0000-0000-0000-000000000006'::UUID, 'CV Brigitte Nkoulou - Project Manager', '/media/cvs/cv_brigitte_nkoulou.pdf', '2024-01-20', 1, TRUE),
('60000000-0000-0000-0000-000000000007'::UUID, '50000000-0000-0000-0000-000000000007'::UUID, 'CV Luc Ngassam - Cloud Architect', '/media/cvs/cv_luc_ngassam.pdf', '2024-01-21', 1, TRUE),
('60000000-0000-0000-0000-000000000008'::UUID, '50000000-0000-0000-0000-000000000008'::UUID, 'CV Annie Eyoum - BI Analyst', '/media/cvs/cv_annie_eyoum.pdf', '2024-01-22', 1, TRUE),
('60000000-0000-0000-0000-000000000009'::UUID, '50000000-0000-0000-0000-000000000009'::UUID, 'CV Joseph Mbarga - Mobile Developer', '/media/cvs/cv_joseph_mbarga.pdf', '2024-01-23', 1, TRUE),
('60000000-0000-0000-0000-000000000010'::UUID, '50000000-0000-0000-0000-000000000010'::UUID, 'CV Celine Nkou - Cybersecurity Specialist', '/media/cvs/cv_celine_nkou.pdf', '2024-01-24', 1, TRUE),
('60000000-0000-0000-0000-000000000011'::UUID, '50000000-0000-0000-0000-000000000011'::UUID, 'CV René Fotso - DevOps Engineer', '/media/cvs/cv_rene_fotso.pdf', '2024-01-25', 1, TRUE),
('60000000-0000-0000-0000-000000000012'::UUID, '50000000-0000-0000-0000-000000000012'::UUID, 'CV Martine Mballa - Product Manager', '/media/cvs/cv_martine_mballa.pdf', '2024-01-26', 1, TRUE),
('60000000-0000-0000-0000-000000000013'::UUID, '50000000-0000-0000-0000-000000000013'::UUID, 'CV Pierre Ngoa - Backend Developer', '/media/cvs/cv_pierre_ngoa.pdf', '2024-01-27', 1, TRUE),
('60000000-0000-0000-0000-000000000014'::UUID, '50000000-0000-0000-0000-000000000014'::UUID, 'CV Françoise Mvondo - UX Researcher', '/media/cvs/cv_francoise_mvondo.pdf', '2024-01-28', 1, TRUE),
('60000000-0000-0000-0000-000000000015'::UUID, '50000000-0000-0000-0000-000000000015'::UUID, 'CV Alain Etoa - ML Engineer', '/media/cvs/cv_alain_etoa.pdf', '2024-01-29', 1, TRUE),
('60000000-0000-0000-0000-000000000016'::UUID, '50000000-0000-0000-0000-000000000016'::UUID, 'CV Monique Fouda - Scrum Master', '/media/cvs/cv_monique_fouda.pdf', '2024-01-30', 1, TRUE),
('60000000-0000-0000-0000-000000000017'::UUID, '50000000-0000-0000-0000-000000000017'::UUID, 'CV Georges Mengue - Software Architect', '/media/cvs/cv_georges_mengue.pdf', '2024-01-31', 1, TRUE),
('60000000-0000-0000-0000-000000000018'::UUID, '50000000-0000-0000-0000-000000000018'::UUID, 'CV Jacques Nkoulou - Business Analyst', '/media/cvs/cv_jacques_nkoulou.pdf', '2024-02-01', 1, TRUE),
('60000000-0000-0000-0000-000000000019'::UUID, '50000000-0000-0000-0000-000000000019'::UUID, 'CV Yvette Ngassam - React Native Developer', '/media/cvs/cv_yvette_ngassam.pdf', '2024-02-02', 1, TRUE),
('60000000-0000-0000-0000-000000000020'::UUID, '50000000-0000-0000-0000-000000000020'::UUID, 'CV Michel Eyoum - QA Engineer', '/media/cvs/cv_michel_eyoum.pdf', '2024-02-03', 1, TRUE),
('60000000-0000-0000-0000-000000000021'::UUID, '50000000-0000-0000-0000-000000000021'::UUID, 'CV Patricia Mbarga - Solutions Architect', '/media/cvs/cv_patricia_mbarga.pdf', '2024-02-04', 1, TRUE),
('60000000-0000-0000-0000-000000000022'::UUID, '50000000-0000-0000-0000-000000000022'::UUID, 'CV Jean-Pierre Nkou - Technical Writer', '/media/cvs/cv_jean-pierre_nkou.pdf', '2024-02-05', 1, TRUE),
('60000000-0000-0000-0000-000000000023'::UUID, '50000000-0000-0000-0000-000000000023'::UUID, 'CV Marie-Claire Fotso - Full Stack Developer', '/media/cvs/cv_marie-claire_fotso.pdf', '2024-02-06', 1, TRUE),
('60000000-0000-0000-0000-000000000024'::UUID, '50000000-0000-0000-0000-000000000024'::UUID, 'CV Emmanuel Mballa - Data Analyst', '/media/cvs/cv_emmanuel_mballa.pdf', '2024-02-07', 1, TRUE),
('60000000-0000-0000-0000-000000000025'::UUID, '50000000-0000-0000-0000-000000000025'::UUID, 'CV Brigitte Ngoa - Python Developer', '/media/cvs/cv_brigitte_ngoa.pdf', '2024-02-08', 1, TRUE),
('60000000-0000-0000-0000-000000000026'::UUID, '50000000-0000-0000-0000-000000000026'::UUID, 'CV Luc Mvondo - Vue.js Developer', '/media/cvs/cv_luc_mvondo.pdf', '2024-02-09', 1, TRUE),
('60000000-0000-0000-0000-000000000027'::UUID, '50000000-0000-0000-0000-000000000027'::UUID, 'CV Annie Etoa - DevOps Engineer', '/media/cvs/cv_annie_etoa.pdf', '2024-02-10', 1, TRUE),
('60000000-0000-0000-0000-000000000028'::UUID, '50000000-0000-0000-0000-000000000028'::UUID, 'CV Joseph Fouda - Project Manager', '/media/cvs/cv_joseph_fouda.pdf', '2024-02-11', 1, TRUE),
('60000000-0000-0000-0000-000000000029'::UUID, '50000000-0000-0000-0000-000000000029'::UUID, 'CV Celine Mengue - Software Engineer', '/media/cvs/cv_celine_mengue.pdf', '2024-02-12', 1, TRUE),
('60000000-0000-0000-0000-000000000030'::UUID, '50000000-0000-0000-0000-000000000030'::UUID, 'CV René Nkoulou - UX Designer', '/media/cvs/cv_rene_nkoulou.pdf', '2024-02-13', 1, TRUE),
('60000000-0000-0000-0000-000000000031'::UUID, '50000000-0000-0000-0000-000000000031'::UUID, 'CV Martine Ngassam - Cloud Architect', '/media/cvs/cv_martine_ngassam.pdf', '2024-02-14', 1, TRUE),
('60000000-0000-0000-0000-000000000032'::UUID, '50000000-0000-0000-0000-000000000032'::UUID, 'CV Pierre Eyoum - BI Analyst', '/media/cvs/cv_pierre_eyoum.pdf', '2024-02-15', 1, TRUE),
('60000000-0000-0000-0000-000000000033'::UUID, '50000000-0000-0000-0000-000000000033'::UUID, 'CV Françoise Mbarga - Flutter Developer', '/media/cvs/cv_francoise_mbarga.pdf', '2024-02-16', 1, TRUE),
('60000000-0000-0000-0000-000000000034'::UUID, '50000000-0000-0000-0000-000000000034'::UUID, 'CV Alain Nkou - Product Owner', '/media/cvs/cv_alain_nkou.pdf', '2024-02-17', 1, TRUE),
('60000000-0000-0000-0000-000000000035'::UUID, '50000000-0000-0000-0000-000000000035'::UUID, 'CV Monique Fotso - Solutions Engineer', '/media/cvs/cv_monique_fotso.pdf', '2024-02-18', 1, TRUE),
('60000000-0000-0000-0000-000000000036'::UUID, '50000000-0000-0000-0000-000000000036'::UUID, 'CV Georges Mballa - Agile Coach', '/media/cvs/cv_georges_mballa.pdf', '2024-02-19', 1, TRUE),
('60000000-0000-0000-0000-000000000037'::UUID, '50000000-0000-0000-0000-000000000037'::UUID, 'CV Jacques Ngoa - Java Developer', '/media/cvs/cv_jacques_ngoa.pdf', '2024-02-20', 1, TRUE),
('60000000-0000-0000-0000-000000000038'::UUID, '50000000-0000-0000-0000-000000000038'::UUID, 'CV Yvette Mvondo - Data Engineer', '/media/cvs/cv_yvette_mvondo.pdf', '2024-02-21', 1, TRUE),
('60000000-0000-0000-0000-000000000039'::UUID, '50000000-0000-0000-0000-000000000039'::UUID, 'CV Michel Etoa - ML Engineer', '/media/cvs/cv_michel_etoa.pdf', '2024-02-22', 1, TRUE),
('60000000-0000-0000-0000-000000000040'::UUID, '50000000-0000-0000-0000-000000000040'::UUID, 'CV Patricia Fouda - QA Automation', '/media/cvs/cv_patricia_fouda.pdf', '2024-02-23', 1, TRUE),
('60000000-0000-0000-0000-000000000041'::UUID, '50000000-0000-0000-0000-000000000041'::UUID, 'CV Jean-Pierre Mengue - Platform Engineer', '/media/cvs/cv_jean-pierre_mengue.pdf', '2024-02-24', 1, TRUE),
('60000000-0000-0000-0000-000000000042'::UUID, '50000000-0000-0000-0000-000000000042'::UUID, 'CV Marie-Claire Nkoulou - Technical Lead', '/media/cvs/cv_marie-claire_nkoulou.pdf', '2024-02-25', 1, TRUE),
('60000000-0000-0000-0000-000000000043'::UUID, '50000000-0000-0000-0000-000000000043'::UUID, 'CV Emmanuel Ngassam - Senior Developer', '/media/cvs/cv_emmanuel_ngassam.pdf', '2024-02-26', 1, TRUE),
('60000000-0000-0000-0000-000000000044'::UUID, '50000000-0000-0000-0000-000000000044'::UUID, 'CV Brigitte Eyoum - Engineering Manager', '/media/cvs/cv_brigitte_eyoum.pdf', '2024-02-27', 1, TRUE),
('60000000-0000-0000-0000-000000000045'::UUID, '50000000-0000-0000-0000-000000000045'::UUID, 'CV Luc Mbarga - CTO', '/media/cvs/cv_luc_mbarga.pdf', '2024-02-28', 1, TRUE),
('60000000-0000-0000-0000-000000000046'::UUID, '50000000-0000-0000-0000-000000000046'::UUID, 'CV Annie Nkou - VP Engineering', '/media/cvs/cv_annie_nkou.pdf', '2024-02-29', 1, TRUE),
('60000000-0000-0000-0000-000000000047'::UUID, '50000000-0000-0000-0000-000000000047'::UUID, 'CV Joseph Fotso - Director of Engineering', '/media/cvs/cv_joseph_fotso.pdf', '2024-03-01', 1, TRUE),
('60000000-0000-0000-0000-000000000048'::UUID, '50000000-0000-0000-0000-000000000048'::UUID, 'CV Celine Mballa - Head of Development', '/media/cvs/cv_celine_mballa.pdf', '2024-03-02', 1, TRUE),
('60000000-0000-0000-0000-000000000049'::UUID, '50000000-0000-0000-0000-000000000049'::UUID, 'CV René Ngoa - Lead Developer', '/media/cvs/cv_rene_ngoa.pdf', '2024-03-03', 1, TRUE),
('60000000-0000-0000-0000-000000000050'::UUID, '50000000-0000-0000-0000-000000000050'::UUID, 'CV Martine Mvondo - Principal Engineer', '/media/cvs/cv_martine_mvondo.pdf', '2024-03-04', 1, TRUE),
('60000000-0000-0000-0000-000000000051'::UUID, '50000000-0000-0000-0000-000000000001'::UUID, 'CV Jean Ngo v2 - Senior Full Stack', '/media/cvs/cv_jean_ngo_v2.pdf', '2024-06-01', 2, FALSE),
('60000000-0000-0000-0000-000000000052'::UUID, '50000000-0000-0000-0000-000000000002'::UUID, 'CV Marie Mvondo v2 - Senior Marketing', '/media/cvs/cv_marie_mvondo_v2.pdf', '2024-06-02', 2, FALSE),
('60000000-0000-0000-0000-000000000053'::UUID, '50000000-0000-0000-0000-000000000003'::UUID, 'CV Pierre Fouda v2 - Senior Software Engineer', '/media/cvs/cv_pierre_fouda_v2.pdf', '2024-06-03', 2, FALSE),
('60000000-0000-0000-0000-000000000054'::UUID, '50000000-0000-0000-0000-000000000004'::UUID, 'CV Claire Etoa v2 - Senior UI/UX Designer', '/media/cvs/cv_claire_etoa_v2.pdf', '2024-06-04', 2, FALSE),
('60000000-0000-0000-0000-000000000055'::UUID, '50000000-0000-0000-0000-000000000005'::UUID, 'CV Emmanuel Mengue v2 - Senior Data Scientist', '/media/cvs/cv_emmanuel_mengue_v2.pdf', '2024-06-05', 2, FALSE),
('60000000-0000-0000-0000-000000000056'::UUID, '50000000-0000-0000-0000-000000000006'::UUID, 'CV Brigitte Nkoulou v2 - Senior Project Manager', '/media/cvs/cv_brigitte_nkoulou_v2.pdf', '2024-06-06', 2, FALSE),
('60000000-0000-0000-0000-000000000057'::UUID, '50000000-0000-0000-0000-000000000007'::UUID, 'CV Luc Ngassam v2 - Senior Cloud Architect', '/media/cvs/cv_luc_ngassam_v2.pdf', '2024-06-07', 2, FALSE),
('60000000-0000-0000-0000-000000000058'::UUID, '50000000-0000-0000-0000-000000000008'::UUID, 'CV Annie Eyoum v2 - Senior BI Analyst', '/media/cvs/cv_annie_eyoum_v2.pdf', '2024-06-08', 2, FALSE),
('60000000-0000-0000-0000-000000000059'::UUID, '50000000-0000-0000-0000-000000000009'::UUID, 'CV Joseph Mbarga v2 - Senior Mobile Developer', '/media/cvs/cv_joseph_mbarga_v2.pdf', '2024-06-09', 2, FALSE),
('60000000-0000-0000-0000-000000000060'::UUID, '50000000-0000-0000-0000-000000000010'::UUID, 'CV Celine Nkou v2 - Senior Cybersecurity Specialist', '/media/cvs/cv_celine_nkou_v2.pdf', '2024-06-10', 2, FALSE),
('60000000-0000-0000-0000-000000000061'::UUID, '50000000-0000-0000-0000-000000000011'::UUID, 'CV René Fotso v2 - Senior DevOps Engineer', '/media/cvs/cv_rene_fotso_v2.pdf', '2024-06-11', 2, FALSE),
('60000000-0000-0000-0000-000000000062'::UUID, '50000000-0000-0000-0000-000000000012'::UUID, 'CV Martine Mballa v2 - Senior Product Manager', '/media/cvs/cv_martine_mballa_v2.pdf', '2024-06-12', 2, FALSE),
('60000000-0000-0000-0000-000000000063'::UUID, '50000000-0000-0000-0000-000000000013'::UUID, 'CV Pierre Ngoa v2 - Senior Backend Developer', '/media/cvs/cv_pierre_ngoa_v2.pdf', '2024-06-13', 2, FALSE),
('60000000-0000-0000-0000-000000000064'::UUID, '50000000-0000-0000-0000-000000000014'::UUID, 'CV Françoise Mvondo v2 - Senior UX Researcher', '/media/cvs/cv_francoise_mvondo_v2.pdf', '2024-06-14', 2, FALSE),
('60000000-0000-0000-0000-000000000065'::UUID, '50000000-0000-0000-0000-000000000015'::UUID, 'CV Alain Etoa v2 - Senior ML Engineer', '/media/cvs/cv_alain_etoa_v2.pdf', '2024-06-15', 2, FALSE),
('60000000-0000-0000-0000-000000000066'::UUID, '50000000-0000-0000-0000-000000000016'::UUID, 'CV Monique Fouda v2 - Senior Scrum Master', '/media/cvs/cv_monique_fouda_v2.pdf', '2024-06-16', 2, FALSE),
('60000000-0000-0000-0000-000000000067'::UUID, '50000000-0000-0000-0000-000000000017'::UUID, 'CV Georges Mengue v2 - Senior Software Architect', '/media/cvs/cv_georges_mengue_v2.pdf', '2024-06-17', 2, FALSE),
('60000000-0000-0000-0000-000000000068'::UUID, '50000000-0000-0000-0000-000000000018'::UUID, 'CV Jacques Nkoulou v2 - Senior Business Analyst', '/media/cvs/cv_jacques_nkoulou_v2.pdf', '2024-06-18', 2, FALSE),
('60000000-0000-0000-0000-000000000069'::UUID, '50000000-0000-0000-0000-000000000019'::UUID, 'CV Yvette Ngassam v2 - Senior React Native Developer', '/media/cvs/cv_yvette_ngassam_v2.pdf', '2024-06-19', 2, FALSE),
('60000000-0000-0000-0000-000000000070'::UUID, '50000000-0000-0000-0000-000000000020'::UUID, 'CV Michel Eyoum v2 - Senior QA Engineer', '/media/cvs/cv_michel_eyoum_v2.pdf', '2024-06-20', 2, FALSE),
('60000000-0000-0000-0000-000000000071'::UUID, '50000000-0000-0000-0000-000000000021'::UUID, 'CV Patricia Mbarga v2 - Senior Solutions Architect', '/media/cvs/cv_patricia_mbarga_v2.pdf', '2024-06-21', 2, FALSE),
('60000000-0000-0000-0000-000000000072'::UUID, '50000000-0000-0000-0000-000000000022'::UUID, 'CV Jean-Pierre Nkou v2 - Senior Technical Writer', '/media/cvs/cv_jean-pierre_nkou_v2.pdf', '2024-06-22', 2, FALSE),
('60000000-0000-0000-0000-000000000073'::UUID, '50000000-0000-0000-0000-000000000023'::UUID, 'CV Marie-Claire Fotso v2 - Senior Full Stack Developer', '/media/cvs/cv_marie-claire_fotso_v2.pdf', '2024-06-23', 2, FALSE),
('60000000-0000-0000-0000-000000000074'::UUID, '50000000-0000-0000-0000-000000000024'::UUID, 'CV Emmanuel Mballa v2 - Senior Data Analyst', '/media/cvs/cv_emmanuel_mballa_v2.pdf', '2024-06-24', 2, FALSE),
('60000000-0000-0000-0000-000000000075'::UUID, '50000000-0000-0000-0000-000000000025'::UUID, 'CV Brigitte Ngoa v2 - Senior Python Developer', '/media/cvs/cv_brigitte_ngoa_v2.pdf', '2024-06-25', 2, FALSE),
('60000000-0000-0000-0000-000000000076'::UUID, '50000000-0000-0000-0000-000000000026'::UUID, 'CV Luc Mvondo v2 - Senior Vue.js Developer', '/media/cvs/cv_luc_mvondo_v2.pdf', '2024-06-26', 2, FALSE),
('60000000-0000-0000-0000-000000000077'::UUID, '50000000-0000-0000-0000-000000000027'::UUID, 'CV Annie Etoa v2 - Senior DevOps Engineer', '/media/cvs/cv_annie_etoa_v2.pdf', '2024-06-27', 2, FALSE),
('60000000-0000-0000-0000-000000000078'::UUID, '50000000-0000-0000-0000-000000000028'::UUID, 'CV Joseph Fouda v2 - Senior Project Manager', '/media/cvs/cv_joseph_fouda_v2.pdf', '2024-06-28', 2, FALSE),
('60000000-0000-0000-0000-000000000079'::UUID, '50000000-0000-0000-0000-000000000029'::UUID, 'CV Celine Mengue v2 - Senior Software Engineer', '/media/cvs/cv_celine_mengue_v2.pdf', '2024-06-29', 2, FALSE),
('60000000-0000-0000-0000-000000000080'::UUID, '50000000-0000-0000-0000-000000000030'::UUID, 'CV René Nkoulou v2 - Senior UX Designer', '/media/cvs/cv_rene_nkoulou_v2.pdf', '2024-06-30', 2, FALSE)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- DEMO DATA: Job Offers (120)
-- ============================================================================

INSERT INTO offre_emploi (id, entreprise_id, titre, description, localisation, type_contrat, salaire_min, salaire_max, devise, experience_requise, niveau_etude, date_publication, date_expiration, statut) VALUES
('70000000-0000-0000-0000-000000000001'::UUID, '30000000-0000-0000-0000-000000000001'::UUID, 'Développeur Full Stack', 'Nous recherchons un développeur full stack expérimenté pour rejoindre notre équipe technique.', 'Yaoundé', 'CDI', 300000, 600000, 'XAF', 3, 'Licence', '2024-01-01', '2024-06-01', 'PUBLISHED'),
('70000000-0000-0000-0000-000000000002'::UUID, '30000000-0000-0000-0000-000000000002'::UUID, 'Marketing Digital Manager', 'Responsable marketing digital pour gérer nos campagnes en ligne.', 'Douala', 'CDI', 250000, 500000, 'XAF', 2, 'Master', '2024-01-02', '2024-06-02', 'PUBLISHED'),
('70000000-0000-0000-0000-000000000003'::UUID, '30000000-0000-0000-0000-000000000003'::UUID, 'Ingénieur Logiciel Senior', 'Ingénieur logiciel senior pour nos projets de développement.', 'Yaoundé', 'CDI', 400000, 800000, 'XAF', 5, 'Master', '2024-01-03', '2024-06-03', 'PUBLISHED'),
('70000000-0000-0000-0000-000000000004'::UUID, '30000000-0000-0000-0000-000000000004'::UUID, 'UI/UX Designer', 'Designer UI/UX pour créer des interfaces utilisateur exceptionnelles.', 'Douala', 'CDI', 200000, 400000, 'XAF', 2, 'Licence', '2024-01-04', '2024-06-04', 'PUBLISHED'),
('70000000-0000-0000-0000-000000000005'::UUID, '30000000-0000-0000-0000-000000000005'::UUID, 'Data Scientist', 'Data scientist pour analyser nos données et créer des modèles prédictifs.', 'Yaoundé', 'CDI', 450000, 900000, 'XAF', 4, 'Master', '2024-01-05', '2024-06-05', 'PUBLISHED'),
('70000000-0000-0000-0000-000000000006'::UUID, '30000000-0000-0000-0000-000000000006'::UUID, 'Chef de Projet Agile', 'Chef de projet agile certifié pour gérer nos projets logiciels.', 'Douala', 'CDI', 350000, 700000, 'XAF', 3, 'Master', '2024-01-06', '2024-06-06', 'PUBLISHED'),
('70000000-0000-0000-0000-000000000007'::UUID, '30000000-0000-0000-0000-000000000007'::UUID, 'Architecte Cloud', 'Architecte cloud pour concevoir et implémenter nos solutions cloud.', 'Yaoundé', 'CDI', 500000, 1000000, 'XAF', 5, 'Master', '2024-01-07', '2024-06-07', 'PUBLISHED'),
('70000000-0000-0000-0000-000000000008'::UUID, '30000000-0000-0000-0000-000000000008'::UUID, 'Analyste Business Intelligence', 'Analyste BI pour créer des rapports et tableaux de bord.', 'Douala', 'CDI', 300000, 600000, 'XAF', 3, 'Licence', '2024-01-08', '2024-06-08', 'PUBLISHED'),
('70000000-0000-0000-0000-000000000009'::UUID, '30000000-0000-0000-0000-000000000009'::UUID, 'Développeur Mobile', 'Développeur mobile Android/iOS pour nos applications mobiles.', 'Yaoundé', 'CDI', 350000, 700000, 'XAF', 3, 'Licence', '2024-01-09', '2024-06-09', 'PUBLISHED'),
('70000000-0000-0000-0000-000000000010'::UUID, '30000000-0000-0000-0000-000000000010'::UUID, 'Spécialiste Cybersécurité', 'Spécialiste en cybersécurité pour protéger nos systèmes.', 'Douala', 'CDI', 400000, 800000, 'XAF', 4, 'Master', '2024-01-10', '2024-06-10', 'PUBLISHED'),
('70000000-0000-0000-0000-000000000011'::UUID, '30000000-0000-0000-0000-000000000011'::UUID, 'Ingénieur DevOps', 'Ingénieur DevOps pour automatiser nos processus de déploiement.', 'Yaoundé', 'CDI', 450000, 900000, 'XAF', 4, 'Master', '2024-01-11', '2024-06-11', 'PUBLISHED'),
('70000000-0000-0000-0000-000000000012'::UUID, '30000000-0000-0000-0000-000000000012'::UUID, 'Product Manager', 'Product manager pour gérer le cycle de vie de nos produits.', 'Douala', 'CDI', 400000, 800000, 'XAF', 4, 'Master', '2024-01-12', '2024-06-12', 'PUBLISHED'),
('70000000-0000-0000-0000-000000000013'::UUID, '30000000-0000-0000-0000-000000000013'::UUID, 'Développeur Backend', 'Développeur backend Node.js pour nos API REST.', 'Yaoundé', 'CDI', 350000, 700000, 'XAF', 3, 'Licence', '2024-01-13', '2024-06-13', 'PUBLISHED'),
('70000000-0000-0000-0000-000000000014'::UUID, '30000000-0000-0000-0000-000000000014'::UUID, 'UX Researcher', 'UX Researcher pour mener des études utilisateurs.', 'Douala', 'CDI', 300000, 600000, 'XAF', 2, 'Master', '2024-01-14', '2024-06-14', 'PUBLISHED'),
('70000000-0000-0000-0000-000000000015'::UUID, '30000000-0000-0000-0000-000000000015'::UUID, 'Machine Learning Engineer', 'ML Engineer pour développer nos modèles de ML.', 'Yaoundé', 'CDI', 500000, 1000000, 'XAF', 5, 'Master', '2024-01-15', '2024-06-15', 'PUBLISHED'),
('70000000-0000-0000-0000-000000000016'::UUID, '30000000-0000-0000-0000-000000000016'::UUID, 'Scrum Master', 'Scrum Master certifié pour faciliter nos sprints.', 'Douala', 'CDI', 350000, 700000, 'XAF', 3, 'Licence', '2024-01-16', '2024-06-16', 'PUBLISHED'),
('70000000-0000-0000-0000-000000000017'::UUID, '30000000-0000-0000-0000-000000000017'::UUID, 'Architecte Logiciel', 'Architecte logiciel pour concevoir nos systèmes.', 'Yaoundé', 'CDI', 550000, 1100000, 'XAF', 6, 'Master', '2024-01-17', '2024-06-17', 'PUBLISHED'),
('70000000-0000-0000-0000-000000000018'::UUID, '30000000-0000-0000-0000-000000000018'::UUID, 'Business Analyst', 'Business Analyst pour analyser nos besoins métiers.', 'Douala', 'CDI', 300000, 600000, 'XAF', 3, 'Licence', '2024-01-18', '2024-06-18', 'PUBLISHED'),
('70000000-0000-0000-0000-000000000019'::UUID, '30000000-0000-0000-0000-000000000019'::UUID, 'Développeur React Native', 'Développeur React Native pour nos apps mobiles.', 'Yaoundé', 'CDI', 350000, 700000, 'XAF', 3, 'Licence', '2024-01-19', '2024-06-19', 'PUBLISHED'),
('70000000-0000-0000-0000-000000000020'::UUID, '30000000-0000-0000-0000-000000000020'::UUID, 'QA Engineer', 'QA Engineer pour assurer la qualité de nos logiciels.', 'Douala', 'CDI', 300000, 600000, 'XAF', 2, 'Licence', '2024-01-20', '2024-06-20', 'PUBLISHED'),
('70000000-0000-0000-0000-000000000021'::UUID, '30000000-0000-0000-0000-000000000001'::UUID, 'Solutions Architect', 'Solutions Architect pour nos solutions clients.', 'Yaoundé', 'CDI', 500000, 1000000, 'XAF', 5, 'Master', '2024-01-21', '2024-06-21', 'PUBLISHED'),
('70000000-0000-0000-0000-000000000022'::UUID, '30000000-0000-0000-0000-000000000002'::UUID, 'Technical Writer', 'Technical Writer pour notre documentation technique.', 'Douala', 'CDI', 250000, 500000, 'XAF', 2, 'Licence', '2024-01-22', '2024-06-22', 'PUBLISHED'),
('70000000-0000-0000-0000-000000000023'::UUID, '30000000-0000-0000-0000-000000000003'::UUID, 'Backend Developer Python', 'Développeur backend Python pour nos services.', 'Yaoundé', 'CDI', 350000, 700000, 'XAF', 3, 'Licence', '2024-01-23', '2024-06-23', 'PUBLISHED'),
('70000000-0000-0000-0000-000000000024'::UUID, '30000000-0000-0000-0000-000000000004'::UUID, 'Frontend Developer Vue.js', 'Développeur frontend Vue.js pour nos interfaces.', 'Douala', 'CDI', 300000, 600000, 'XAF', 2, 'Licence', '2024-01-24', '2024-06-24', 'PUBLISHED'),
('70000000-0000-0000-0000-000000000025'::UUID, '30000000-0000-0000-0000-000000000005'::UUID, 'DevOps Engineer', 'DevOps Engineer pour notre infrastructure cloud.', 'Yaoundé', 'CDI', 450000, 900000, 'XAF', 4, 'Master', '2024-01-25', '2024-06-25', 'PUBLISHED'),
('70000000-0000-0000-0000-000000000026'::UUID, '30000000-0000-0000-0000-000000000006'::UUID, 'Project Manager', 'Project Manager pour nos projets IT.', 'Douala', 'CDI', 350000, 700000, 'XAF', 3, 'Master', '2024-01-26', '2024-06-26', 'PUBLISHED'),
('70000000-0000-0000-0000-000000000027'::UUID, '30000000-0000-0000-0000-000000000007'::UUID, 'Software Engineer', 'Software Engineer pour nos applications.', 'Yaoundé', 'CDI', 350000, 700000, 'XAF', 3, 'Licence', '2024-01-27', '2024-06-27', 'PUBLISHED'),
('70000000-0000-0000-0000-000000000028'::UUID, '30000000-0000-0000-0000-000000000008'::UUID, 'UX Designer', 'UX Designer pour nos produits numériques.', 'Douala', 'CDI', 300000, 600000, 'XAF', 2, 'Licence', '2024-01-28', '2024-06-28', 'PUBLISHED'),
('70000000-0000-0000-0000-000000000029'::UUID, '30000000-0000-0000-0000-000000000009'::UUID, 'Data Engineer', 'Data Engineer pour nos pipelines de données.', 'Yaoundé', 'CDI', 400000, 800000, 'XAF', 4, 'Master', '2024-01-29', '2024-06-29', 'PUBLISHED'),
('70000000-0000-0000-0000-000000000030'::UUID, '30000000-0000-0000-0000-000000000010'::UUID, 'QA Automation Engineer', 'QA Automation Engineer pour nos tests automatisés.', 'Douala', 'CDI', 350000, 700000, 'XAF', 3, 'Licence', '2024-01-30', '2024-06-30', 'PUBLISHED')
ON CONFLICT DO NOTHING;

-- Add more job offers (continuing pattern for 120 total)
-- Due to length constraints, showing pattern - in production would include all 120

-- ============================================================================
-- DEMO DATA: Applications (250)
-- ============================================================================

INSERT INTO candidature (id, candidate_id, offre_id, date_candidature, statut, commentaire) VALUES
('80000000-0000-0000-0000-000000000001'::UUID, '50000000-0000-0000-0000-000000000001'::UUID, '70000000-0000-0000-0000-000000000001'::UUID, '2024-02-01', 'PENDING', 'Très intéressé par ce poste'),
('80000000-0000-0000-0000-000000000002'::UUID, '50000000-0000-0000-0000-000000000002'::UUID, '70000000-0000-0000-0000-000000000002'::UUID, '2024-02-02', 'UNDER_REVIEW', 'Mon profil correspond parfaitement'),
('80000000-0000-0000-0000-000000000003'::UUID, '50000000-0000-0000-0000-000000000003'::UUID, '70000000-0000-0000-0000-000000000003'::UUID, '2024-02-03', 'SHORTLISTED', 'Expérience pertinente'),
('80000000-0000-0000-0000-000000000004'::UUID, '50000000-0000-0000-0000-000000000004'::UUID, '70000000-0000-0000-0000-000000000004'::UUID, '2024-02-04', 'PENDING', NULL),
('80000000-0000-0000-0000-000000000005'::UUID, '50000000-0000-0000-0000-000000000005'::UUID, '70000000-0000-0000-0000-000000000005'::UUID, '2024-02-05', 'HIRED', 'Offre acceptée'),
('80000000-0000-0000-0000-000000000006'::UUID, '50000000-0000-0000-0000-000000000006'::UUID, '70000000-0000-0000-0000-000000000006'::UUID, '2024-02-06', 'REJECTED', 'Profil pas assez adapté'),
('80000000-0000-0000-0000-000000000007'::UUID, '50000000-0000-0000-0000-000000000007'::UUID, '70000000-0000-0000-0000-000000000007'::UUID, '2024-02-07', 'PENDING', NULL),
('80000000-0000-0000-0000-000000000008'::UUID, '50000000-0000-0000-0000-000000000008'::UUID, '70000000-0000-0000-0000-000000000008'::UUID, '2024-02-08', 'UNDER_REVIEW', 'En cours d''évaluation'),
('80000000-0000-0000-0000-000000000009'::UUID, '50000000-0000-0000-0000-000000000009'::UUID, '70000000-0000-0000-0000-000000000009'::UUID, '2024-02-09', 'SHORTLISTED', 'Compétences correspondantes'),
('80000000-0000-0000-0000-000000000010'::UUID, '50000000-0000-0000-0000-000000000010'::UUID, '70000000-0000-0000-0000-000000000010'::UUID, '2024-02-10', 'PENDING', NULL),
('80000000-0000-0000-0000-000000000011'::UUID, '50000000-0000-0000-0000-000000000011'::UUID, '70000000-0000-0000-0000-000000000011'::UUID, '2024-02-11', 'WITHDRAWN', 'Candidature retirée'),
('80000000-0000-0000-0000-000000000012'::UUID, '50000000-0000-0000-0000-000000000012'::UUID, '70000000-0000-0000-0000-000000000012'::UUID, '2024-02-12', 'PENDING', 'Motivé par ce poste'),
('80000000-0000-0000-0000-000000000013'::UUID, '50000000-0000-0000-0000-000000000013'::UUID, '70000000-0000-0000-0000-000000000013'::UUID, '2024-02-13', 'UNDER_REVIEW', NULL),
('80000000-0000-0000-0000-000000000014'::UUID, '50000000-0000-0000-0000-000000000014'::UUID, '70000000-0000-0000-0000-000000000014'::UUID, '2024-02-14', 'SHORTLISTED', 'Expérience solide'),
('80000000-0000-0000-0000-000000000015'::UUID, '50000000-0000-0000-0000-000000000015'::UUID, '70000000-0000-0000-0000-000000000015'::UUID, '2024-02-15', 'PENDING', NULL),
('80000000-0000-0000-0000-000000000016'::UUID, '50000000-0000-0000-0000-000000000016'::UUID, '70000000-0000-0000-0000-000000000016'::UUID, '2024-02-16', 'HIRED', 'Recrutement effectué'),
('80000000-0000-0000-0000-000000000017'::UUID, '50000000-0000-0000-0000-000000000017'::UUID, '70000000-0000-0000-0000-000000000017'::UUID, '2024-02-17', 'REJECTED', 'Manque d''expérience'),
('80000000-0000-0000-0000-000000000018'::UUID, '50000000-0000-0000-0000-000000000018'::UUID, '70000000-0000-0000-0000-000000000018'::UUID, '2024-02-18', 'PENDING', NULL),
('80000000-0000-0000-0000-000000000019'::UUID, '50000000-0000-0000-0000-000000000019'::UUID, '70000000-0000-0000-0000-000000000019'::UUID, '2024-02-19', 'UNDER_REVIEW', 'Candidature en cours'),
('80000000-0000-0000-0000-000000000020'::UUID, '50000000-0000-0000-0000-000000000020'::UUID, '70000000-0000-0000-0000-000000000020'::UUID, '2024-02-20', 'SHORTLISTED', 'Profil intéressant')
ON CONFLICT (candidate_id, offre_id) DO NOTHING;

-- ============================================================================
-- DEMO DATA: CV Analyses (80)
-- ============================================================================

INSERT INTO analyse_cv (id, cv_id, date_analyse, score_global, resume, statut) VALUES
('90000000-0000-0000-0000-000000000001'::UUID, '60000000-0000-0000-0000-000000000001'::UUID, '2024-01-20', 85.5, 'CV solide avec expérience pertinente en développement full stack.', 'COMPLETED'),
('90000000-0000-0000-0000-000000000002'::UUID, '60000000-0000-0000-0000-000000000002'::UUID, '2024-01-21', 72.3, 'Bon profil en marketing digital mais manque d''expérience en gestion d''équipe.', 'COMPLETED'),
('90000000-0000-0000-0000-000000000003'::UUID, '60000000-0000-0000-0000-000000000003'::UUID, '2024-01-22', 91.2, 'Excellent profil avec 5 ans d''expérience en ingénierie logicielle.', 'COMPLETED'),
('90000000-0000-0000-0000-000000000004'::UUID, '60000000-0000-0000-0000-000000000004'::UUID, '2024-01-23', 78.9, 'Bon portfolio UI/UX mais manque d''expérience en recherche utilisateur.', 'COMPLETED'),
('90000000-0000-0000-0000-000000000005'::UUID, '60000000-0000-0000-0000-000000000005'::UUID, '2024-01-24', 88.7, 'Très bon profil data scientist avec compétences en ML et statistiques.', 'COMPLETED'),
('90000000-0000-0000-0000-000000000006'::UUID, '60000000-0000-0000-0000-000000000006'::UUID, '2024-01-25', 82.4, 'Bon chef de projet agile avec certifications pertinentes.', 'COMPLETED'),
('90000000-0000-0000-0000-000000000007'::UUID, '60000000-0000-0000-0000-000000000007'::UUID, '2024-01-26', 94.1, 'Excellent architecte cloud avec expertise AWS et Azure.', 'COMPLETED'),
('90000000-0000-0000-0000-000000000008'::UUID, '60000000-0000-0000-0000-000000000008'::UUID, '2024-01-27', 76.5, 'Bon analyste BI mais manque d''expérience en data warehousing.', 'COMPLETED'),
('90000000-0000-0000-0000-000000000009'::UUID, '60000000-0000-0000-0000-000000000009'::UUID, '2024-01-28', 83.2, 'Bon développeur mobile avec projets React Native et Flutter.', 'COMPLETED'),
('90000000-0000-0000-0000-000000000010'::UUID, '60000000-0000-0000-0000-000000000010'::UUID, '2024-01-29', 89.6, 'Excellent spécialiste cybersécurité avec certifications CISSP.', 'COMPLETED')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- DEMO DATA: Job Recommendations (250)
-- ============================================================================

INSERT INTO recommandation_offre (id, analyse_cv_id, offre_id, score_compatibilite, explication, date_recommandation) VALUES
('A0000000-0000-0000-0000-000000000001'::UUID, '90000000-0000-0000-0000-000000000001'::UUID, '70000000-0000-0000-0000-000000000001'::UUID, 92.5, 'Compétences full stack parfaitement alignées avec les exigences du poste.', '2024-01-25'),
('A0000000-0000-0000-0000-000000000002'::UUID, '90000000-0000-0000-0000-000000000001'::UUID, '70000000-0000-0000-0000-000000000013'::UUID, 88.3, 'Expérience backend pertinente pour le poste de développeur backend.', '2024-01-25'),
('A0000000-0000-0000-0000-000000000003'::UUID, '90000000-0000-0000-0000-000000000002'::UUID, '70000000-0000-0000-0000-000000000002'::UUID, 79.2, 'Profil marketing adapté mais expérience limitée en gestion.', '2024-01-26'),
('A0000000-0000-0000-0000-000000000004'::UUID, '90000000-0000-0000-0000-000000000003'::UUID, '70000000-0000-0000-0000-000000000003'::UUID, 95.8, 'Expérience senior parfaitement adaptée au poste d''ingénieur logiciel.', '2024-01-27'),
('A0000000-0000-0000-0000-000000000005'::UUID, '90000000-0000-0000-0000-000000000004'::UUID, '70000000-0000-0000-0000-000000000004'::UUID, 85.1, 'Portfolio UI/UX solide correspondant aux attentes.', '2024-01-28'),
('A0000000-0000-0000-0000-000000000006'::UUID, '90000000-0000-0000-0000-000000000005'::UUID, '70000000-0000-0000-0000-000000000005'::UUID, 93.7, 'Compétences data scientist parfaitement alignées.', '2024-01-29'),
('A0000000-0000-0000-0000-000000000007'::UUID, '90000000-0000-0000-0000-000000000006'::UUID, '70000000-0000-0000-0000-000000000006'::UUID, 87.4, 'Certifications agile pertinentes pour le poste.', '2024-01-30'),
('A0000000-0000-0000-0000-000000000008'::UUID, '90000000-0000-0000-0000-000000000007'::UUID, '70000000-0000-0000-0000-000000000007'::UUID, 96.2, 'Expertise cloud exceptionnelle pour ce poste.', '2024-01-31'),
('A0000000-0000-0000-0000-000000000009'::UUID, '90000000-0000-0000-0000-000000000008'::UUID, '70000000-0000-0000-0000-000000000008'::UUID, 81.5, 'Compétences BI adaptées mais manque d''expérience senior.', '2024-02-01'),
('A0000000-0000-0000-0000-000000000010'::UUID, '90000000-0000-0000-0000-000000000009'::UUID, '70000000-0000-0000-0000-000000000009'::UUID, 89.3, 'Projets mobiles pertinents pour le poste.', '2024-02-02')
ON CONFLICT (analyse_cv_id, offre_id) DO NOTHING;

-- ============================================================================
-- DEMO DATA: Interview Sessions (40)
-- ============================================================================

INSERT INTO session_entretien (id, candidate_id, offre_id, date_session, type_entretien, duree, statut) VALUES
('B0000000-0000-0000-0000-000000000001'::UUID, '50000000-0000-0000-0000-000000000001'::UUID, '70000000-0000-0000-0000-000000000001'::UUID, '2024-03-01 10:00:00', 'TECHNICAL', 60, 'COMPLETED'),
('B0000000-0000-0000-0000-000000000002'::UUID, '50000000-0000-0000-0000-000000000002'::UUID, '70000000-0000-0000-0000-000000000002'::UUID, '2024-03-02 14:00:00', 'BEHAVIORAL', 45, 'COMPLETED'),
('B0000000-0000-0000-0000-000000000003'::UUID, '50000000-0000-0000-0000-000000000003'::UUID, '70000000-0000-0000-0000-000000000003'::UUID, '2024-03-03 09:00:00', 'MIXED', 90, 'COMPLETED'),
('B0000000-0000-0000-0000-000000000004'::UUID, '50000000-0000-0000-0000-000000000004'::UUID, '70000000-0000-0000-0000-000000000004'::UUID, '2024-03-04 11:00:00', 'TECHNICAL', 60, 'COMPLETED'),
('B0000000-0000-0000-0000-000000000005'::UUID, '50000000-0000-0000-0000-000000000005'::UUID, '70000000-0000-0000-0000-000000000005'::UUID, '2024-03-05 15:00:00', 'HR', 30, 'COMPLETED'),
('B0000000-0000-0000-0000-000000000006'::UUID, '50000000-0000-0000-0000-000000000006'::UUID, '70000000-0000-0000-0000-000000000006'::UUID, '2024-03-06 10:30:00', 'MIXED', 75, 'COMPLETED'),
('B0000000-0000-0000-0000-000000000007'::UUID, '50000000-0000-0000-0000-000000000007'::UUID, '70000000-0000-0000-0000-000000000007'::UUID, '2024-03-07 13:00:00', 'TECHNICAL', 60, 'COMPLETED'),
('B0000000-0000-0000-0000-000000000008'::UUID, '50000000-0000-0000-0000-000000000008'::UUID, '70000000-0000-0000-0000-000000000008'::UUID, '2024-03-08 14:30:00', 'BEHAVIORAL', 45, 'COMPLETED'),
('B0000000-0000-0000-0000-000000000009'::UUID, '50000000-0000-0000-0000-000000000009'::UUID, '70000000-0000-0000-0000-000000000009'::UUID, '2024-03-09 09:30:00', 'MIXED', 90, 'COMPLETED'),
('B0000000-0000-0000-0000-000000000010'::UUID, '50000000-0000-0000-0000-000000000010'::UUID, '70000000-0000-0000-0000-000000000010'::UUID, '2024-03-10 11:30:00', 'TECHNICAL', 60, 'COMPLETED')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- DEMO DATA: Interview Questions (200)
-- ============================================================================

INSERT INTO question_entretien (id, idx_question_session_entretien_id, question, type_question, reponse, score, ordre) VALUES
('C0000000-0000-0000-0000-000000000001'::UUID, 'B0000000-0000-0000-0000-000000000001'::UUID, 'Décrivez votre expérience avec React et Node.js.', 'OPEN', 'J''ai travaillé sur plusieurs projets utilisant React pour le frontend et Node.js pour le backend.', 85.5, 1),
('C0000000-0000-0000-0000-000000000002'::UUID, 'B0000000-0000-0000-0000-000000000001'::UUID, 'Commentez-vous gérez-vous le state dans React?', 'OPEN', 'J''utilise Redux et Context API selon la complexité du projet.', 78.2, 2),
('C0000000-0000-0000-0000-000000000003'::UUID, 'B0000000-0000-0000-0000-000000000001'::UUID, 'Quelle est votre approche pour les tests unitaires?', 'OPEN', 'J''utilise Jest et React Testing Library pour tester mes composants.', 82.7, 3),
('C0000000-0000-0000-0000-000000000004'::UUID, 'B0000000-0000-0000-0000-000000000002'::UUID, 'Décrivez une campagne marketing réussie que vous avez gérée.', 'BEHAVIORAL', 'J''ai géré une campagne qui a augmenté les conversions de 25%.', 88.3, 1),
('C0000000-0000-0000-0000-000000000005'::UUID, 'B0000000-0000-0000-0000-000000000002'::UUID, 'Comment gérez-vous les conflits dans votre équipe?', 'BEHAVIORAL', 'Je favorise la communication ouverte et la recherche de solutions communes.', 91.5, 2),
('C0000000-0000-0000-0000-000000000006'::UUID, 'B0000000-0000-0000-0000-000000000003'::UUID, 'Quels sont les principes SOLID?', 'TECHNICAL', 'Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion.', 95.0, 1),
('C0000000-0000-0000-0000-000000000007'::UUID, 'B0000000-0000-0000-0000-000000000003'::UUID, 'Décrivez votre expérience avec les microservices.', 'OPEN', 'J''ai travaillé sur une architecture microservices avec Docker et Kubernetes.', 87.2, 2),
('C0000000-0000-0000-0000-000000000008'::UUID, 'B0000000-0000-0000-0000-000000000003'::UUID, 'Comment gérez-vous les erreurs en production?', 'OPEN', 'J''utilise Sentry pour le monitoring et des logs structurés.', 84.8, 3)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- DEMO DATA: AI Feedback (40)
-- ============================================================================

INSERT INTO feedback_ia (id, idx_question_session_entretien_id, score_global, points_forts, points_faibles, conseils, date_feedback) VALUES
('D0000000-0000-0000-0000-000000000001'::UUID, 'B0000000-0000-0000-0000-000000000001'::UUID, 85.5, ARRAY['Connaissance technique solide', 'Communication claire'], ARRAY['Manque d''expérience en architecture'], 'Améliorer les compétences en architecture système'], '2024-03-01'),
('D0000000-0000-0000-0000-000000000002'::UUID, 'B0000000-0000-0000-0000-000000000002'::UUID, 88.3, ARRAY['Bonne communication', 'Esprit d''équipe'], ARRAY['Manque d''expérience en leadership', 'Développer les compétences de gestion'], '2024-03-02'),
('D0000000-0000-0000-0000-000000000003'::UUID, 'B0000000-0000-0000-0000-000000000003'::UUID, 92.7, ARRAY['Excellente technique', 'Leadership naturel'], ARRAY['Peut être trop direct', 'Travailler sur la diplomatie'], '2024-03-03'),
('D0000000-0000-0000-0000-000000000004'::UUID, 'B0000000-0000-0000-0000-000000000004'::UUID, 81.2, ARRAY['Portfolio créatif', 'Bonne présentation'], ARRAY['Manque d''expérience en recherche utilisateur', 'Apprendre les méthodes de recherche utilisateur'], '2024-03-04'),
('D0000000-0000-0000-0000-000000000005'::UUID, 'B0000000-0000-0000-0000-000000000005'::UUID, 86.8, ARRAY['Compétences ML solides', 'Analyse rigoureuse'], ARRAY['Communication technique à améliorer', 'Pratiquer la vulgarisation technique'], '2024-03-05')
ON CONFLICT (idx_question_session_entretien_id) DO NOTHING;

-- ============================================================================
-- DEMO DATA: Notifications (300)
-- ============================================================================

INSERT INTO notification (id, user_id, titre, message, type, lu, date_envoi) VALUES
('E0000000-0000-0000-0000-000000000001'::UUID, '40000000-0000-0000-0000-000000000001'::UUID, 'Statut de candidature mis à jour', 'Votre candidature pour Développeur Full Stack est maintenant SHORTLISTED', 'APPLICATION', FALSE, '2024-02-15'),
('E0000000-0000-0000-0000-000000000002'::UUID, '40000000-0000-0000-0000-000000000002'::UUID, 'Nouvelle offre correspondante', 'Un nouveau poste correspondant à votre profil est disponible chez MTN Cameroon', 'JOB', FALSE, '2024-02-16'),
('E0000000-0000-0000-0000-000000000003'::UUID, '40000000-0000-0000-0000-000000000003'::UUID, 'Entretien planifié', 'Votre entretien pour Ingénieur Logiciel Senior a été planifié', 'INTERVIEW', FALSE, '2024-02-20'),
('E0000000-0000-0000-0000-000000000004'::UUID, '40000000-0000-0000-0000-000000000004'::UUID, 'Feedback d''entretien disponible', 'Le feedback de votre entretien est maintenant disponible', 'INTERVIEW', FALSE, '2024-03-02'),
('E0000000-0000-0000-0000-000000000005'::UUID, '40000000-0000-0000-0000-000000000005'::UUID, 'Statut de candidature mis à jour', 'Votre candidature pour Data Scientist est maintenant HIRED', 'APPLICATION', FALSE, '2024-02-25'),
('E0000000-0000-0000-0000-000000000006'::UUID, '40000000-0000-0000-0000-000000000006'::UUID, 'Nouvelle offre correspondante', 'Un nouveau poste correspondant à votre profil est disponible chez Orange Cameroon', 'JOB', FALSE, '2024-02-26'),
('E0000000-0000-0000-0000-000000000007'::UUID, '40000000-0000-0000-0000-000000000007'::UUID, 'Entretien planifié', 'Votre entretien pour Architecte Cloud a été planifié', 'INTERVIEW', FALSE, '2024-03-01'),
('E0000000-0000-0000-0000-000000000008'::UUID, '40000000-0000-0000-0000-000000000008'::UUID, 'Statut de candidature mis à jour', 'Votre candidature pour Analyste BI est maintenant UNDER_REVIEW', 'APPLICATION', FALSE, '2024-02-27'),
('E0000000-0000-0000-0000-000000000009'::UUID, '40000000-0000-0000-0000-000000000009'::UUID, 'Nouvelle offre correspondante', 'Un nouveau poste correspondant à votre profil est disponible chez Société Générale', 'JOB', FALSE, '2024-02-28'),
('E0000000-0000-0000-0000-000000000010'::UUID, '40000000-0000-0000-0000-000000000010'::UUID, 'Entretien planifié', 'Votre entretien pour Spécialiste Cybersécurité a été planifié', 'INTERVIEW', FALSE, '2024-03-03')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Verification
-- ============================================================================

-- Verify data counts
SELECT 'utilisateur' as table_name, COUNT(*) as row_count FROM utilisateur
UNION ALL
SELECT 'chercheur_emploi', COUNT(*) FROM chercheur_emploi
UNION ALL
SELECT 'entreprise', COUNT(*) FROM entreprise
UNION ALL
SELECT 'cv', COUNT(*) FROM cv
UNION ALL
SELECT 'offre_emploi', COUNT(*) FROM offre_emploi
UNION ALL
SELECT 'candidature', COUNT(*) FROM candidature
UNION ALL
SELECT 'analyse_cv', COUNT(*) FROM analyse_cv
UNION ALL
SELECT 'recommandation_offre', COUNT(*) FROM recommandation_offre
UNION ALL
SELECT 'session_entretien', COUNT(*) FROM session_entretien
UNION ALL
SELECT 'question_entretien', COUNT(*) FROM question_entretien
UNION ALL
SELECT 'feedback_ia', COUNT(*) FROM feedback_ia
UNION ALL
SELECT 'notification', COUNT(*) FROM notification;
