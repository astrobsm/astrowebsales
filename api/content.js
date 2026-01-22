// Vercel Serverless Function - Content Management API
import { getPool, handleCors } from './_lib/db.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  const pool = getPool();
  const { method, query, body } = req;
  const { type, id } = query; // type: 'clinical-apps', 'training', 'offices', 'downloads'

  try {
    // ==================== CLINICAL APPS ====================
    if (type === 'clinical-apps') {
      if (method === 'GET') {
        const result = await pool.query(
          'SELECT * FROM clinical_apps WHERE active = true ORDER BY featured DESC, rating DESC'
        );
        const apps = result.rows.map(row => ({
          id: row.app_id || `app-${row.id}`,
          name: row.name,
          description: row.description,
          category: row.category,
          platform: row.platform,
          price: row.price,
          icon: row.icon,
          url: row.url,
          iosUrl: row.ios_url,
          featured: row.featured,
          rating: parseFloat(row.rating) || 0
        }));
        return res.status(200).json(apps);
      }

      if (method === 'POST') {
        const { id: appId, name, description, category, platform, price, icon, url, iosUrl, featured, rating } = body;
        const result = await pool.query(`
          INSERT INTO clinical_apps (app_id, name, description, category, platform, price, icon, url, ios_url, featured, rating)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT (app_id) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            category = EXCLUDED.category,
            platform = EXCLUDED.platform,
            price = EXCLUDED.price,
            icon = EXCLUDED.icon,
            url = EXCLUDED.url,
            ios_url = EXCLUDED.ios_url,
            featured = EXCLUDED.featured,
            rating = EXCLUDED.rating,
            updated_at = CURRENT_TIMESTAMP
          RETURNING *
        `, [appId || `app-${Date.now()}`, name, description, category, platform, price || 'Free', icon, url, iosUrl, featured || false, rating || 0]);
        return res.status(201).json(result.rows[0]);
      }

      if (method === 'PUT' && id) {
        const { name, description, category, platform, price, icon, url, iosUrl, featured, rating } = body;
        const result = await pool.query(`
          UPDATE clinical_apps SET
            name = COALESCE($1, name),
            description = COALESCE($2, description),
            category = COALESCE($3, category),
            platform = COALESCE($4, platform),
            price = COALESCE($5, price),
            icon = COALESCE($6, icon),
            url = COALESCE($7, url),
            ios_url = COALESCE($8, ios_url),
            featured = COALESCE($9, featured),
            rating = COALESCE($10, rating),
            updated_at = CURRENT_TIMESTAMP
          WHERE app_id = $11 OR id::text = $11
          RETURNING *
        `, [name, description, category, platform, price, icon, url, iosUrl, featured, rating, id]);
        return res.status(200).json(result.rows[0]);
      }

      if (method === 'DELETE' && id) {
        await pool.query('UPDATE clinical_apps SET active = false WHERE app_id = $1 OR id::text = $1', [id]);
        return res.status(200).json({ success: true });
      }
    }

    // ==================== TRAINING COURSES ====================
    if (type === 'training') {
      if (method === 'GET') {
        const result = await pool.query(
          'SELECT * FROM training_courses WHERE active = true ORDER BY rating DESC, students DESC'
        );
        const courses = result.rows.map(row => ({
          id: row.course_id || `train-${row.id}`,
          title: row.title,
          description: row.description,
          instructor: row.instructor,
          duration: row.duration,
          level: row.level,
          certification: row.certification,
          price: row.price,
          image: row.image_url,
          students: row.students || 0,
          rating: parseFloat(row.rating) || 0,
          modules: row.modules || []
        }));
        return res.status(200).json(courses);
      }

      if (method === 'POST') {
        const { id: courseId, title, description, instructor, duration, level, certification, price, image, students, rating, modules } = body;
        const result = await pool.query(`
          INSERT INTO training_courses (course_id, title, description, instructor, duration, level, certification, price, image_url, students, rating, modules)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          ON CONFLICT (course_id) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            instructor = EXCLUDED.instructor,
            duration = EXCLUDED.duration,
            level = EXCLUDED.level,
            certification = EXCLUDED.certification,
            price = EXCLUDED.price,
            image_url = EXCLUDED.image_url,
            students = EXCLUDED.students,
            rating = EXCLUDED.rating,
            modules = EXCLUDED.modules,
            updated_at = CURRENT_TIMESTAMP
          RETURNING *
        `, [courseId || `train-${Date.now()}`, title, description, instructor, duration, level, certification || false, price || 'Free', image, students || 0, rating || 0, JSON.stringify(modules || [])]);
        return res.status(201).json(result.rows[0]);
      }

      if (method === 'PUT' && id) {
        const { title, description, instructor, duration, level, certification, price, image, students, rating, modules } = body;
        const result = await pool.query(`
          UPDATE training_courses SET
            title = COALESCE($1, title),
            description = COALESCE($2, description),
            instructor = COALESCE($3, instructor),
            duration = COALESCE($4, duration),
            level = COALESCE($5, level),
            certification = COALESCE($6, certification),
            price = COALESCE($7, price),
            image_url = COALESCE($8, image_url),
            students = COALESCE($9, students),
            rating = COALESCE($10, rating),
            modules = COALESCE($11, modules),
            updated_at = CURRENT_TIMESTAMP
          WHERE course_id = $12 OR id::text = $12
          RETURNING *
        `, [title, description, instructor, duration, level, certification, price, image, students, rating, modules ? JSON.stringify(modules) : null, id]);
        return res.status(200).json(result.rows[0]);
      }

      if (method === 'DELETE' && id) {
        await pool.query('UPDATE training_courses SET active = false WHERE course_id = $1 OR id::text = $1', [id]);
        return res.status(200).json({ success: true });
      }
    }

    // ==================== OFFICES ====================
    if (type === 'offices') {
      if (method === 'GET') {
        const result = await pool.query(
          'SELECT * FROM offices WHERE active = true ORDER BY is_headquarters DESC, title'
        );
        const offices = result.rows.map(row => ({
          id: row.office_id || `office-${row.id}`,
          title: row.title,
          address: row.address,
          phone: row.phone,
          email: row.email,
          hours: row.hours,
          isHeadquarters: row.is_headquarters
        }));
        return res.status(200).json(offices);
      }

      if (method === 'POST') {
        const { id: officeId, title, address, phone, email, hours, isHeadquarters } = body;
        const result = await pool.query(`
          INSERT INTO offices (office_id, title, address, phone, email, hours, is_headquarters)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (office_id) DO UPDATE SET
            title = EXCLUDED.title,
            address = EXCLUDED.address,
            phone = EXCLUDED.phone,
            email = EXCLUDED.email,
            hours = EXCLUDED.hours,
            is_headquarters = EXCLUDED.is_headquarters,
            updated_at = CURRENT_TIMESTAMP
          RETURNING *
        `, [officeId || `office-${Date.now()}`, title, address, phone, email, hours, isHeadquarters || false]);
        return res.status(201).json(result.rows[0]);
      }

      if (method === 'PUT' && id) {
        const { title, address, phone, email, hours, isHeadquarters } = body;
        const result = await pool.query(`
          UPDATE offices SET
            title = COALESCE($1, title),
            address = COALESCE($2, address),
            phone = COALESCE($3, phone),
            email = COALESCE($4, email),
            hours = COALESCE($5, hours),
            is_headquarters = COALESCE($6, is_headquarters),
            updated_at = CURRENT_TIMESTAMP
          WHERE office_id = $7 OR id::text = $7
          RETURNING *
        `, [title, address, phone, email, hours, isHeadquarters, id]);
        return res.status(200).json(result.rows[0]);
      }

      if (method === 'DELETE' && id) {
        await pool.query('UPDATE offices SET active = false WHERE office_id = $1 OR id::text = $1', [id]);
        return res.status(200).json({ success: true });
      }
    }

    // ==================== DOWNLOADS ====================
    if (type === 'downloads') {
      if (method === 'GET') {
        const result = await pool.query(
          'SELECT * FROM downloads WHERE active = true ORDER BY featured DESC, downloads DESC'
        );
        const downloads = result.rows.map(row => ({
          id: row.download_id || `dl-${row.id}`,
          title: row.title,
          description: row.description,
          category: row.category,
          fileUrl: row.file_url,
          fileSize: row.file_size,
          fileType: row.file_type,
          downloads: row.downloads || 0,
          featured: row.featured,
          date: row.created_at
        }));
        return res.status(200).json(downloads);
      }

      if (method === 'POST') {
        const { id: downloadId, title, description, category, fileUrl, fileSize, fileType, featured } = body;
        const result = await pool.query(`
          INSERT INTO downloads (download_id, title, description, category, file_url, file_size, file_type, featured)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (download_id) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            category = EXCLUDED.category,
            file_url = EXCLUDED.file_url,
            file_size = EXCLUDED.file_size,
            file_type = EXCLUDED.file_type,
            featured = EXCLUDED.featured,
            updated_at = CURRENT_TIMESTAMP
          RETURNING *
        `, [downloadId || `dl-${Date.now()}`, title, description, category, fileUrl, fileSize, fileType, featured || false]);
        return res.status(201).json(result.rows[0]);
      }

      if (method === 'PUT' && id) {
        const { title, description, category, fileUrl, fileSize, fileType, featured, downloads } = body;
        const result = await pool.query(`
          UPDATE downloads SET
            title = COALESCE($1, title),
            description = COALESCE($2, description),
            category = COALESCE($3, category),
            file_url = COALESCE($4, file_url),
            file_size = COALESCE($5, file_size),
            file_type = COALESCE($6, file_type),
            featured = COALESCE($7, featured),
            downloads = COALESCE($8, downloads),
            updated_at = CURRENT_TIMESTAMP
          WHERE download_id = $9 OR id::text = $9
          RETURNING *
        `, [title, description, category, fileUrl, fileSize, fileType, featured, downloads, id]);
        return res.status(200).json(result.rows[0]);
      }

      if (method === 'DELETE' && id) {
        await pool.query('UPDATE downloads SET active = false WHERE download_id = $1 OR id::text = $1', [id]);
        return res.status(200).json({ success: true });
      }

      // Increment download count
      if (method === 'PATCH' && id) {
        await pool.query('UPDATE downloads SET downloads = downloads + 1 WHERE download_id = $1 OR id::text = $1', [id]);
        return res.status(200).json({ success: true });
      }
    }

    // ==================== SYNC ALL CONTENT ====================
    if (type === 'sync') {
      if (method === 'GET') {
        // Fetch all content for initial sync
        const [appsResult, trainingResult, officesResult, downloadsResult] = await Promise.all([
          pool.query('SELECT * FROM clinical_apps WHERE active = true ORDER BY featured DESC, rating DESC'),
          pool.query('SELECT * FROM training_courses WHERE active = true ORDER BY rating DESC'),
          pool.query('SELECT * FROM offices WHERE active = true ORDER BY is_headquarters DESC'),
          pool.query('SELECT * FROM downloads WHERE active = true ORDER BY featured DESC')
        ]);

        return res.status(200).json({
          clinicalApps: appsResult.rows.map(row => ({
            id: row.app_id || `app-${row.id}`,
            name: row.name,
            description: row.description,
            category: row.category,
            platform: row.platform,
            price: row.price,
            icon: row.icon,
            url: row.url,
            iosUrl: row.ios_url,
            featured: row.featured,
            rating: parseFloat(row.rating) || 0
          })),
          training: trainingResult.rows.map(row => ({
            id: row.course_id || `train-${row.id}`,
            title: row.title,
            description: row.description,
            instructor: row.instructor,
            duration: row.duration,
            level: row.level,
            certification: row.certification,
            price: row.price,
            image: row.image_url,
            students: row.students || 0,
            rating: parseFloat(row.rating) || 0,
            modules: row.modules || []
          })),
          offices: officesResult.rows.map(row => ({
            id: row.office_id || `office-${row.id}`,
            title: row.title,
            address: row.address,
            phone: row.phone,
            email: row.email,
            hours: row.hours,
            isHeadquarters: row.is_headquarters
          })),
          downloads: downloadsResult.rows.map(row => ({
            id: row.download_id || `dl-${row.id}`,
            title: row.title,
            description: row.description,
            category: row.category,
            fileUrl: row.file_url,
            fileSize: row.file_size,
            fileType: row.file_type,
            downloads: row.downloads || 0,
            featured: row.featured
          })),
          lastSync: new Date().toISOString()
        });
      }

      // Bulk sync - save all content
      if (method === 'POST') {
        const { clinicalApps, training, offices, downloads } = body;

        // Sync clinical apps
        if (clinicalApps && clinicalApps.length > 0) {
          for (const app of clinicalApps) {
            await pool.query(`
              INSERT INTO clinical_apps (app_id, name, description, category, platform, price, icon, url, ios_url, featured, rating)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
              ON CONFLICT (app_id) DO UPDATE SET
                name = EXCLUDED.name,
                description = EXCLUDED.description,
                category = EXCLUDED.category,
                platform = EXCLUDED.platform,
                price = EXCLUDED.price,
                icon = EXCLUDED.icon,
                url = EXCLUDED.url,
                ios_url = EXCLUDED.ios_url,
                featured = EXCLUDED.featured,
                rating = EXCLUDED.rating,
                updated_at = CURRENT_TIMESTAMP
            `, [app.id, app.name, app.description, app.category, app.platform, app.price, app.icon, app.url, app.iosUrl, app.featured, app.rating]);
          }
        }

        // Sync training
        if (training && training.length > 0) {
          for (const course of training) {
            await pool.query(`
              INSERT INTO training_courses (course_id, title, description, instructor, duration, level, certification, price, image_url, students, rating, modules)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
              ON CONFLICT (course_id) DO UPDATE SET
                title = EXCLUDED.title,
                description = EXCLUDED.description,
                instructor = EXCLUDED.instructor,
                duration = EXCLUDED.duration,
                level = EXCLUDED.level,
                certification = EXCLUDED.certification,
                price = EXCLUDED.price,
                image_url = EXCLUDED.image_url,
                students = EXCLUDED.students,
                rating = EXCLUDED.rating,
                modules = EXCLUDED.modules,
                updated_at = CURRENT_TIMESTAMP
            `, [course.id, course.title, course.description, course.instructor, course.duration, course.level, course.certification, course.price, course.image, course.students, course.rating, JSON.stringify(course.modules || [])]);
          }
        }

        // Sync offices
        if (offices && offices.length > 0) {
          for (const office of offices) {
            await pool.query(`
              INSERT INTO offices (office_id, title, address, phone, email, hours, is_headquarters)
              VALUES ($1, $2, $3, $4, $5, $6, $7)
              ON CONFLICT (office_id) DO UPDATE SET
                title = EXCLUDED.title,
                address = EXCLUDED.address,
                phone = EXCLUDED.phone,
                email = EXCLUDED.email,
                hours = EXCLUDED.hours,
                is_headquarters = EXCLUDED.is_headquarters,
                updated_at = CURRENT_TIMESTAMP
            `, [office.id, office.title, office.address, office.phone, office.email, office.hours, office.isHeadquarters]);
          }
        }

        // Sync downloads
        if (downloads && downloads.length > 0) {
          for (const download of downloads) {
            await pool.query(`
              INSERT INTO downloads (download_id, title, description, category, file_url, file_size, file_type, featured, downloads)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
              ON CONFLICT (download_id) DO UPDATE SET
                title = EXCLUDED.title,
                description = EXCLUDED.description,
                category = EXCLUDED.category,
                file_url = EXCLUDED.file_url,
                file_size = EXCLUDED.file_size,
                file_type = EXCLUDED.file_type,
                featured = EXCLUDED.featured,
                downloads = EXCLUDED.downloads,
                updated_at = CURRENT_TIMESTAMP
            `, [download.id, download.title, download.description, download.category, download.fileUrl, download.fileSize, download.fileType, download.featured, download.downloads || 0]);
          }
        }

        return res.status(200).json({ success: true, message: 'Content synced successfully' });
      }
    }

    return res.status(400).json({ error: 'Invalid content type. Use: clinical-apps, training, offices, downloads, or sync' });

  } catch (error) {
    console.error('Content API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
