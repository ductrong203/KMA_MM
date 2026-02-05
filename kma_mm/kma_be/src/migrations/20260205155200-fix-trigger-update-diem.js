'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // 1. Drop existing triggers
        await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS trg_update_tong_tin_chi_insert;`);
        await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS trg_update_tong_tin_chi_update;`);

        // 2. Recreate INSERT trigger with fix
        await queryInterface.sequelize.query(`
      CREATE TRIGGER trg_update_tong_tin_chi_insert BEFORE INSERT ON diem
      FOR EACH ROW
      BEGIN
        DECLARE so_tin_chi INT;
        DECLARE tinh_diem INT;
        DECLARE final_ck FLOAT;
        DECLARE diem_thanh_phan FLOAT;
        DECLARE diem_ket_thuc FLOAT;
        DECLARE qua_mon BOOLEAN DEFAULT FALSE;
        DECLARE da_co_lan_qua_mon INT;

        DECLARE diem_thi_toi_thieu FLOAT;
        DECLARE diem_trung_binh_dat FLOAT;
        DECLARE diem_chuyen_can_toi_thieu FLOAT;
        DECLARE diem_giua_ky_toi_thieu FLOAT;

        SELECT
            qd.diem_thi_toi_thieu,
            qd.diem_trung_binh_dat,
            qd.diem_chuyen_can_toi_thieu,
            qd.diem_giua_ky_toi_thieu
        INTO
            diem_thi_toi_thieu,
            diem_trung_binh_dat,
            diem_chuyen_can_toi_thieu,
            diem_giua_ky_toi_thieu
        FROM quy_dinh_diem qd
        LIMIT 1;

        SELECT mh.so_tin_chi, mh.tinh_diem
        INTO so_tin_chi, tinh_diem
        FROM mon_hoc mh
        INNER JOIN thoi_khoa_bieu tkb ON mh.id = tkb.mon_hoc_id
        WHERE tkb.id = NEW.thoi_khoa_bieu_id;

        IF tinh_diem = 1 THEN

            SELECT COUNT(*) INTO da_co_lan_qua_mon
            FROM diem d
            INNER JOIN thoi_khoa_bieu tkb ON d.thoi_khoa_bieu_id = tkb.id
            WHERE d.sinh_vien_id = NEW.sinh_vien_id
            AND tkb.mon_hoc_id = (
                SELECT tkb2.mon_hoc_id
                FROM thoi_khoa_bieu tkb2
                WHERE tkb2.id = NEW.thoi_khoa_bieu_id
            )
            AND d.id != NEW.id
            AND d.trang_thai = 'qua_mon';

            SET final_ck = COALESCE(NEW.diem_ck2, NEW.diem_ck);

            IF NEW.diem_tp1 IS NOT NULL AND NEW.diem_tp2 IS NOT NULL AND final_ck IS NOT NULL THEN
                SET diem_thanh_phan = 0.7 * NEW.diem_tp1 + 0.3 * NEW.diem_tp2;
                SET diem_ket_thuc = diem_thanh_phan * 0.3 + final_ck * 0.7;
                SET diem_ket_thuc = CEIL(diem_ket_thuc * 10) / 10;

                IF final_ck >= diem_thi_toi_thieu
                    AND diem_ket_thuc >= diem_trung_binh_dat
                    AND NEW.diem_tp2 >= diem_chuyen_can_toi_thieu
                    AND NEW.diem_tp1 >= diem_giua_ky_toi_thieu THEN
                    SET qua_mon = TRUE;
                END IF;
            END IF;

            IF qua_mon THEN
                SET NEW.trang_thai = 'qua_mon';

                IF da_co_lan_qua_mon = 0 THEN
                    UPDATE sinh_vien
                    SET tong_tin_chi = COALESCE(tong_tin_chi, 0) + so_tin_chi
                    WHERE id = NEW.sinh_vien_id;
                END IF;
            ELSEIF NEW.trang_thai != 'hoc_lai' THEN
                SET NEW.trang_thai = 'rot_mon';
            END IF;
        END IF;
      END;
    `);

        // 3. Recreate UPDATE trigger with fix
        await queryInterface.sequelize.query(`
      CREATE TRIGGER trg_update_tong_tin_chi_update BEFORE UPDATE ON diem
      FOR EACH ROW
      BEGIN
        DECLARE so_tin_chi INT;
        DECLARE tinh_diem INT;

        DECLARE final_ck_new FLOAT;
        DECLARE final_ck_old FLOAT;
        DECLARE diem_thanh_phan_new FLOAT;
        DECLARE diem_thanh_phan_old FLOAT;
        DECLARE diem_ket_thuc_new FLOAT;
        DECLARE diem_ket_thuc_old FLOAT;
        DECLARE qua_mon_new BOOLEAN DEFAULT FALSE;
        DECLARE qua_mon_old BOOLEAN DEFAULT FALSE;
        DECLARE da_co_lan_qua_mon INT;


        DECLARE diem_thi_toi_thieu FLOAT;
        DECLARE diem_trung_binh_dat FLOAT;
        DECLARE diem_chuyen_can_toi_thieu FLOAT;
        DECLARE diem_giua_ky_toi_thieu FLOAT;


        SELECT
            qd.diem_thi_toi_thieu,
            qd.diem_trung_binh_dat,
            qd.diem_chuyen_can_toi_thieu,
            qd.diem_giua_ky_toi_thieu
        INTO
            diem_thi_toi_thieu,
            diem_trung_binh_dat,
            diem_chuyen_can_toi_thieu,
            diem_giua_ky_toi_thieu
        FROM quy_dinh_diem qd
        LIMIT 1;


        SELECT mh.so_tin_chi, mh.tinh_diem
        INTO so_tin_chi, tinh_diem
        FROM mon_hoc mh
        JOIN thoi_khoa_bieu tkb ON mh.id = tkb.mon_hoc_id
        WHERE tkb.id = NEW.thoi_khoa_bieu_id;


        IF tinh_diem = 1 THEN


            SELECT COUNT(*) INTO da_co_lan_qua_mon
            FROM diem d
            JOIN thoi_khoa_bieu tkb ON d.thoi_khoa_bieu_id = tkb.id
            WHERE d.sinh_vien_id = NEW.sinh_vien_id
            AND tkb.mon_hoc_id = (
                SELECT tkb2.mon_hoc_id
                FROM thoi_khoa_bieu tkb2
                WHERE tkb2.id = NEW.thoi_khoa_bieu_id
            )
            AND d.id != NEW.id
            AND d.trang_thai = 'qua_mon';


            SET final_ck_new = COALESCE(NEW.diem_ck2, NEW.diem_ck);

            IF NEW.diem_tp1 IS NOT NULL AND NEW.diem_tp2 IS NOT NULL AND final_ck_new IS NOT NULL THEN
                SET diem_thanh_phan_new = 0.7 * NEW.diem_tp1 + 0.3 * NEW.diem_tp2;
                SET diem_ket_thuc_new = diem_thanh_phan_new * 0.3 + final_ck_new * 0.7;
                SET diem_ket_thuc_new = CEIL(diem_ket_thuc_new * 10) / 10;

                IF final_ck_new >= diem_thi_toi_thieu
                    AND diem_ket_thuc_new >= diem_trung_binh_dat
                    AND NEW.diem_tp2 >= diem_chuyen_can_toi_thieu
                    AND NEW.diem_tp1 >= diem_giua_ky_toi_thieu THEN
                    SET qua_mon_new = TRUE;
                END IF;
            END IF;


            SET final_ck_old = COALESCE(OLD.diem_ck2, OLD.diem_ck);

            IF OLD.diem_tp1 IS NOT NULL AND OLD.diem_tp2 IS NOT NULL AND final_ck_old IS NOT NULL THEN
                SET diem_thanh_phan_old = 0.7 * OLD.diem_tp1 + 0.3 * OLD.diem_tp2;
                SET diem_ket_thuc_old = diem_thanh_phan_old * 0.3 + final_ck_old * 0.7;
                SET diem_ket_thuc_old = CEIL(diem_ket_thuc_old * 10) / 10;

                IF final_ck_old >= diem_thi_toi_thieu
                    AND diem_ket_thuc_old >= diem_trung_binh_dat
                    AND OLD.diem_tp2 >= diem_chuyen_can_toi_thieu
                    AND OLD.diem_tp1 >= diem_giua_ky_toi_thieu THEN
                    SET qua_mon_old = TRUE;
                END IF;
            END IF;


            IF qua_mon_new AND NOT qua_mon_old AND da_co_lan_qua_mon = 0 THEN
                UPDATE sinh_vien
                SET tong_tin_chi = COALESCE(tong_tin_chi, 0) + so_tin_chi
                WHERE id = NEW.sinh_vien_id;
            END IF;


            IF qua_mon_new THEN
                SET NEW.trang_thai = 'qua_mon';
            ELSEIF NEW.trang_thai != 'hoc_lai' THEN
                SET NEW.trang_thai = 'rot_mon';
            END IF;
        END IF;
      END;
    `);
    },

    async down(queryInterface, Sequelize) {
        // Restore original triggers logic (revert fix)
        await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS trg_update_tong_tin_chi_insert;`);
        await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS trg_update_tong_tin_chi_update;`);

        await queryInterface.sequelize.query(`
      CREATE TRIGGER trg_update_tong_tin_chi_insert BEFORE INSERT ON diem
      FOR EACH ROW
      BEGIN
        DECLARE so_tin_chi INT;
        DECLARE tinh_diem INT;
        DECLARE final_ck FLOAT;
        DECLARE diem_thanh_phan FLOAT;
        DECLARE diem_ket_thuc FLOAT;
        DECLARE qua_mon BOOLEAN DEFAULT FALSE;
        DECLARE da_co_lan_qua_mon INT;

        DECLARE diem_thi_toi_thieu FLOAT;
        DECLARE diem_trung_binh_dat FLOAT;
        DECLARE diem_chuyen_can_toi_thieu FLOAT;
        DECLARE diem_giua_ky_toi_thieu FLOAT;

        SELECT
            qd.diem_thi_toi_thieu,
            qd.diem_trung_binh_dat,
            qd.diem_chuyen_can_toi_thieu,
            qd.diem_giua_ky_toi_thieu
        INTO
            diem_thi_toi_thieu,
            diem_trung_binh_dat,
            diem_chuyen_can_toi_thieu,
            diem_giua_ky_toi_thieu
        FROM quy_dinh_diem qd
        LIMIT 1;

        SELECT mh.so_tin_chi, mh.tinh_diem
        INTO so_tin_chi, tinh_diem
        FROM mon_hoc mh
        INNER JOIN thoi_khoa_bieu tkb ON mh.id = tkb.mon_hoc_id
        WHERE tkb.id = NEW.thoi_khoa_bieu_id;

        IF tinh_diem = 1 THEN

            SELECT COUNT(*) INTO da_co_lan_qua_mon
            FROM diem d
            INNER JOIN thoi_khoa_bieu tkb ON d.thoi_khoa_bieu_id = tkb.id
            WHERE d.sinh_vien_id = NEW.sinh_vien_id
            AND tkb.mon_hoc_id = (
                SELECT tkb2.mon_hoc_id
                FROM thoi_khoa_bieu tkb2
                WHERE tkb2.id = NEW.thoi_khoa_bieu_id
            )
            AND d.id != NEW.id
            AND d.trang_thai = 'qua_mon';

            SET final_ck = COALESCE(NEW.diem_ck2, NEW.diem_ck);

            IF NEW.diem_tp1 IS NOT NULL AND NEW.diem_tp2 IS NOT NULL AND final_ck IS NOT NULL THEN
                SET diem_thanh_phan = 0.7 * NEW.diem_tp1 + 0.3 * NEW.diem_tp2;
                SET diem_ket_thuc = diem_thanh_phan * 0.3 + final_ck * 0.7;
                SET diem_ket_thuc = CEIL(diem_ket_thuc * 10) / 10;

                IF final_ck >= diem_thi_toi_thieu
                    AND diem_ket_thuc >= diem_trung_binh_dat
                    AND NEW.diem_tp2 >= diem_chuyen_can_toi_thieu
                    AND NEW.diem_tp1 >= diem_giua_ky_toi_thieu THEN
                    SET qua_mon = TRUE;
                END IF;
            END IF;

            IF qua_mon THEN
                SET NEW.trang_thai = 'qua_mon';

                IF da_co_lan_qua_mon = 0 THEN
                    UPDATE sinh_vien
                    SET tong_tin_chi = COALESCE(tong_tin_chi, 0) + so_tin_chi
                    WHERE id = NEW.sinh_vien_id;
                END IF;
            ELSE
                SET NEW.trang_thai = 'rot_mon';
            END IF;
        END IF;
      END;
    `);

        await queryInterface.sequelize.query(`
      CREATE TRIGGER trg_update_tong_tin_chi_update BEFORE UPDATE ON diem
      FOR EACH ROW
      BEGIN
        DECLARE so_tin_chi INT;
        DECLARE tinh_diem INT;

        DECLARE final_ck_new FLOAT;
        DECLARE final_ck_old FLOAT;
        DECLARE diem_thanh_phan_new FLOAT;
        DECLARE diem_thanh_phan_old FLOAT;
        DECLARE diem_ket_thuc_new FLOAT;
        DECLARE diem_ket_thuc_old FLOAT;
        DECLARE qua_mon_new BOOLEAN DEFAULT FALSE;
        DECLARE qua_mon_old BOOLEAN DEFAULT FALSE;
        DECLARE da_co_lan_qua_mon INT;

        DECLARE diem_thi_toi_thieu FLOAT;
        DECLARE diem_trung_binh_dat FLOAT;
        DECLARE diem_chuyen_can_toi_thieu FLOAT;
        DECLARE diem_giua_ky_toi_thieu FLOAT;

        SELECT
            qd.diem_thi_toi_thieu,
            qd.diem_trung_binh_dat,
            qd.diem_chuyen_can_toi_thieu,
            qd.diem_giua_ky_toi_thieu
        INTO
            diem_thi_toi_thieu,
            diem_trung_binh_dat,
            diem_chuyen_can_toi_thieu,
            diem_giua_ky_toi_thieu
        FROM quy_dinh_diem qd
        LIMIT 1;

        SELECT mh.so_tin_chi, mh.tinh_diem
        INTO so_tin_chi, tinh_diem
        FROM mon_hoc mh
        JOIN thoi_khoa_bieu tkb ON mh.id = tkb.mon_hoc_id
        WHERE tkb.id = NEW.thoi_khoa_bieu_id;

        IF tinh_diem = 1 THEN

            SELECT COUNT(*) INTO da_co_lan_qua_mon
            FROM diem d
            JOIN thoi_khoa_bieu tkb ON d.thoi_khoa_bieu_id = tkb.id
            WHERE d.sinh_vien_id = NEW.sinh_vien_id
            AND tkb.mon_hoc_id = (
                SELECT tkb2.mon_hoc_id
                FROM thoi_khoa_bieu tkb2
                WHERE tkb2.id = NEW.thoi_khoa_bieu_id
            )
            AND d.id != NEW.id
            AND d.trang_thai = 'qua_mon';

            SET final_ck_new = COALESCE(NEW.diem_ck2, NEW.diem_ck);

            IF NEW.diem_tp1 IS NOT NULL AND NEW.diem_tp2 IS NOT NULL AND final_ck_new IS NOT NULL THEN
                SET diem_thanh_phan_new = 0.7 * NEW.diem_tp1 + 0.3 * NEW.diem_tp2;
                SET diem_ket_thuc_new = diem_thanh_phan_new * 0.3 + final_ck_new * 0.7;
                SET diem_ket_thuc_new = CEIL(diem_ket_thuc_new * 10) / 10;

                IF final_ck_new >= diem_thi_toi_thieu
                    AND diem_ket_thuc_new >= diem_trung_binh_dat
                    AND NEW.diem_tp2 >= diem_chuyen_can_toi_thieu
                    AND NEW.diem_tp1 >= diem_giua_ky_toi_thieu THEN
                    SET qua_mon_new = TRUE;
                END IF;
            END IF;

            SET final_ck_old = COALESCE(OLD.diem_ck2, OLD.diem_ck);

            IF OLD.diem_tp1 IS NOT NULL AND OLD.diem_tp2 IS NOT NULL AND final_ck_old IS NOT NULL THEN
                SET diem_thanh_phan_old = 0.7 * OLD.diem_tp1 + 0.3 * OLD.diem_tp2;
                SET diem_ket_thuc_old = diem_thanh_phan_old * 0.3 + final_ck_old * 0.7;
                SET diem_ket_thuc_old = CEIL(diem_ket_thuc_old * 10) / 10;

                IF final_ck_old >= diem_thi_toi_thieu
                    AND diem_ket_thuc_old >= diem_trung_binh_dat
                    AND OLD.diem_tp2 >= diem_chuyen_can_toi_thieu
                    AND OLD.diem_tp1 >= diem_giua_ky_toi_thieu THEN
                    SET qua_mon_old = TRUE;
                END IF;
            END IF;

            IF qua_mon_new AND NOT qua_mon_old AND da_co_lan_qua_mon = 0 THEN
                UPDATE sinh_vien
                SET tong_tin_chi = COALESCE(tong_tin_chi, 0) + so_tin_chi
                WHERE id = NEW.sinh_vien_id;
            END IF;

            IF qua_mon_new THEN
                SET NEW.trang_thai = 'qua_mon';
            ELSE
                SET NEW.trang_thai = 'rot_mon';
            END IF;
        END IF;
      END;
    `);
    }
};
