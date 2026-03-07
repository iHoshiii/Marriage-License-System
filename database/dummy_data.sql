-- ==========================================================
-- REALISTIC FILIPINO DUMMY DATA FOR MARRIAGE APPLICATIONS
-- 50 Marriage Applications (1 Groom, 1 Bride each)
-- ==========================================================

DO $$
DECLARE
    u_id UUID;
    app_id UUID;
    g_addr_id UUID;
    b_addr_id UUID;
    
    -- COMMON FILIPINO SURNAMES
    surnames TEXT[] := ARRAY[
        'Santos', 'Reyes', 'Cruz', 'Bautista', 'Ocampo', 'Garcia', 'Mendoza', 'Torres', 'Tomas', 'Andaya',
        'Perez', 'Villanueva', 'Ramos', 'Castro', 'Rivera', 'Santiago', 'Soriano', 'Aquino', 'Del Rosario', 'Lopez',
        'Gomez', 'Salvador', 'Marquez', 'Sarmiento', 'Pascual', 'Quinto', 'Corpuz', 'Agustin', 'Francisco', 'Bernardo',
        'Dela Cruz', 'Dela Rosa', 'Gutierrez', 'Valdez', 'Fernando', 'Castillo', 'Espinoza', 'Navarro', 'Mercado', 'De Guzman',
        'Abad', 'Solis', 'Suarez', 'Gonzales', 'Enriquez', 'Lazaro', 'Alfonso', 'David', 'Lim', 'Tan'
    ];

    -- COMMON FILIPINO MALE NAMES
    male_names TEXT[] := ARRAY[
        'Juan', 'Jose', 'Ricardo', 'Antonio', 'Manuel', 'Rogelio', 'Roberto', 'Eduardo', 'Gabriel', 'Bener',
        'Danilo', 'Edgardo', 'Felipe', 'Gerardo', 'Homer', 'Ismael', 'Jaime', 'Kevin', 'Leonardo', 'Mario',
        'Nestor', 'Orlando', 'Paquito', 'Quentin', 'Romeo', 'Samuel', 'Teodoro', 'Urbano', 'Victor', 'Wilfredo',
        'Zaldy', 'Christian', 'Mark', 'Angelo', 'Paolo', 'Vincent', 'Bryan', 'Darwin', 'Erwin', 'Ferdinand',
        'Gregorio', 'Hezekiah', 'Ibarra', 'Jerome', 'Kenji', 'Leonel', 'Michael', 'Nathan', 'Oscar', 'Patrick'
    ];

    -- COMMON FILIPINO FEMALE NAMES
    female_names TEXT[] := ARRAY[
        'Maria', 'Elena', 'Cristina', 'Teresita', 'Imelda', 'Corazon', 'Luzviminda', 'Gloria', 'Flordeliza', 'Bernadette',
        'Carmela', 'Divina', 'Evelyn', 'Fe', 'Gina', 'Hilda', 'Irene', 'Julieta', 'Katrina', 'Liza',
        'Myrna', 'Nelia', 'Ofelia', 'Perla', 'Queenie', 'Rosalie', 'Sonia', 'Thelma', 'Ursula', 'Virginia',
        'Winnie', 'Xandra', 'Yolanda', 'Zenaida', 'Aileen', 'Bianca', 'Cynthia', 'Daisy', 'Estrella', 'Felicidad',
        'Gemma', 'Hazel', 'Isabella', 'Janice', 'Kristine', 'Lilibeth', 'Maricel', 'Nanette', 'Olive', 'Patricia'
    ];

    -- SOLANO BARANGAYS
    barangays TEXT[] := ARRAY[
        'Aggub', 'Bangaan', 'Bangar', 'Bascaran', 'Curifang', 'Dadap', 'Lactawan', 'Mabasin', 'Magsaysay', 'Osmeña',
        'Poblacion South', 'Poblacion North', 'Quezon', 'Quirino', 'Roxas', 'San Juan', 'San Luis', 'Tucal', 'Udaidi', 'Wacal'
    ];

    i INTEGER;
    created_ts TIMESTAMPTZ;
BEGIN
    -- Ensure pgcrypto is enabled
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    -- 1. CLEANUP (Optional)
    -- DELETE FROM auth.users WHERE email LIKE 'test.couple%@example.com'; -- Uncomment if you want to reset

    -- 2. CREATE ADMIN (Admin12345)
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@example.com') THEN
        u_id := gen_random_uuid();
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, aud, role)
        VALUES (u_id, 'admin@example.com', crypt('Admin12345', gen_salt('bf')), now(), jsonb_build_object('full_name', 'System Administrator'), 'authenticated', 'authenticated');
        UPDATE public.profiles SET role = 'admin' WHERE id = u_id;
    END IF;

    -- 3. CREATE EMPLOYEES (3) (Employee12345)
    FOR i IN 1..3 LOOP
        IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = format('employee%s@example.com', i)) THEN
            u_id := gen_random_uuid();
            INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, aud, role)
            VALUES (u_id, format('employee%s@example.com', i), crypt('Employee12345', gen_salt('bf')), now(), jsonb_build_object('full_name', format('Staff Member %s', i)), 'authenticated', 'authenticated');
            UPDATE public.profiles SET role = 'employee', employee_id = format('SOL-EMP-%s', floor(random()*900 + 100)) WHERE id = u_id;
        END IF;
    END LOOP;

    -- 4. CREATE 50 MARRIAGE APPLICATIONS
    FOR i IN 1..50 LOOP
        -- Random creation time over the last 90 days to look realistic
        created_ts := now() - (random() * interval '90 days');

        -- Create Auth User (Representing one of the couple or a common account)
        u_id := gen_random_uuid();
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, aud, role, created_at)
        VALUES (
            u_id, 
            format('couple%s@example.com', i), 
            crypt('User12345', gen_salt('bf')), 
            created_ts, 
            jsonb_build_object('full_name', format('%s %s', male_names[i], surnames[i])), 
            'authenticated', 
            'authenticated',
            created_ts
        );

        -- Create Application
        app_id := gen_random_uuid();
        INSERT INTO public.marriage_applications (
            id, application_code, status, created_by, created_at, updated_at, contact_number
        ) VALUES (
            app_id, 
            substring(md5(random()::text), 1, 6),
            'pending',
            u_id,
            created_ts,
            created_ts + (random() * interval '2 days'),
            format('091%s%s', floor(random()*9 + 1), floor(random()*8999999 + 1000000))
        );

        -- Create Groom Address
        groom_addr_id := gen_random_uuid();
        INSERT INTO public.addresses (id, province, municipality, barangay, street_address, country, created_at)
        VALUES (
            groom_addr_id, 'Nueva Vizcaya', 'Solano', barangays[floor(random()*20 + 1)], 
            format('Block %s, Lot %s, %s St.', floor(random()*20+1), floor(random()*50+1), i), 
            'Philippines', created_ts
        );

        -- Create Bride Address
        bride_addr_id := gen_random_uuid();
        INSERT INTO public.addresses (id, province, municipality, barangay, street_address, country, created_at)
        VALUES (
            bride_addr_id, 'Nueva Vizcaya', 'Solano', barangays[floor(random()*20 + 1)], 
            format('Purok %s, %s Subd.', floor(random()*8+1), surnames[floor(random()*50+1)]), 
            'Philippines', created_ts
        );

        -- Create Groom Applicant (Filipino)
        INSERT INTO public.applicants (
            application_id, type, first_name, last_name, middle_name, birth_date, age, citizenship, 
            address_id, religion, created_at, updated_at, civil_status
        ) VALUES (
            app_id, 'groom', male_names[i], surnames[i], surnames[floor(random()*50 + 1)],
            (created_ts - interval '25 years' - (random() * interval '10 years'))::date,
            25 + floor(random()*10), 'Filipino', g_addr_id, 'Catholic', created_ts, created_ts, 'Single'
        );

        -- Create Bride Applicant (Filipino)
        INSERT INTO public.applicants (
            application_id, type, first_name, last_name, middle_name, birth_date, age, citizenship, 
            address_id, religion, created_at, updated_at, civil_status
        ) VALUES (
            app_id, 'bride', female_names[i], surnames[floor(random()*50 + 1)], surnames[floor(random()*40 + 1)],
            (created_ts - interval '23 years' - (random() * interval '10 years'))::date,
            23 + floor(random()*10), 'Filipino', b_addr_id, 'Catholic', created_ts, created_ts, 'Single'
        );

    END LOOP;
END;
$$;
