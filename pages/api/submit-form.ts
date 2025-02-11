// pages/api/submit-form.ts
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const submissionsFilePath = path.join(process.cwd(), 'submissions.json');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const data = req.body;

      // Read current submissions from JSON file (if exists)
      let submissions = [];
      if (fs.existsSync(submissionsFilePath)) {
        const fileContent = fs.readFileSync(submissionsFilePath, 'utf-8');
        submissions = JSON.parse(fileContent);
      }

      // Append new submission
      submissions.push(data);

      // Write updated submissions back to the JSON file
      fs.writeFileSync(submissionsFilePath, JSON.stringify(submissions, null, 2));

      return res.status(200).json({ message: 'Submission saved successfully' });
    } catch (error) {
      console.error('Error saving submission:', error);
      return res.status(500).json({ message: 'Error saving submission' });
    }
  } else {
    // Method Not Allowed if the request method is not POST
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}