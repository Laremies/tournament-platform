import { NextApiRequest, NextApiResponse } from 'next';
import supabaseAdmin from '@/utils/supabase/supabase_admin';

const viewHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    // call our stored procedure with the page_slug set by the request params slug
    await supabaseAdmin.rpc('increment_views', {
      page_slug: req.query.slug,
    });

    return res.status(200).json({
      message: `Successfully incremented page: ${req.query.slug}`,
    });
  }

  if (req.method === 'GET') {
    // Query the pages table in the database where slug equals the request params slug.
    const { data } = await supabaseAdmin
      .from('analytics')
      .select('view_count')
      .filter('slug', 'eq', req.query.slug);

    if (data) {
      return res.status(200).json({
        total: data[0]?.view_count || null,
      });
    }
  }

  return res.status(400).json({
    message: 'Unsupported Request',
  });
};

export default viewHandler;
