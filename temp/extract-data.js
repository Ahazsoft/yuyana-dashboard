const fs = require('fs').promises;
const path = require('path');
const cheerio = require('cheerio');

// Configuration
const TOURS_DIR = path.join(__dirname, 'tours');
const TOUR_DETAIL_JS = path.join(__dirname, 'assets/js/tour-detail.js');
const OUTPUT_FILE = path.join(__dirname, 'extracted-tours-structured.json');

// Helper: clean text by removing newlines and collapsing multiple spaces
function cleanText(text) {
  if (!text) return null;
  return text
    .replace(/\s+/g, ' ')   // replace all whitespace (including newlines) with single space
    .trim();
}

// Helper: parse price string into a JSON object (also clean)
function parsePrice(priceText) {
  if (!priceText) return null;
  const cleaned = cleanText(priceText);
  const match = cleaned.match(/(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
  if (match) {
    const amount = parseFloat(match[1].replace(/,/g, ''));
    let currency = 'USD';
    if (cleaned.toLowerCase().includes('birr')) currency = 'ETB';
    else if (cleaned.includes('€')) currency = 'EUR';
    else if (cleaned.includes('£')) currency = 'GBP';
    return { text: cleaned, amount, currency };
  }
  return { text: cleaned, amount: null, currency: null };
}

// Extract tour from static HTML file
async function extractFromHtmlFile(filePath) {
  const html = await fs.readFile(filePath, 'utf8');
  const $ = cheerio.load(html);

  // ---- Basic info ----
  const tourTitle = cleanText($('.page-title.style-three .inner-box h2').first().text().trim()) ||
                    cleanText($('h1').first().text().trim());
  if (!tourTitle) return null;

  // Description (overview)
  let tourDescription = cleanText($('.tour-details-content .inner-box .text p').first().text().trim());
  if (!tourDescription) {
    tourDescription = cleanText($('.tour-details-content .text p').first().text().trim());
  }

  // Duration & Destination
  let tourDuration = null;
  let tourDestination = '';
  $('.info-list li').each((i, el) => {
    const text = cleanText($(el).text().trim());
    if (text.match(/\d+\s*(days?|nights?)/i)) {
      const match = text.match(/\d+/);
      if (match) tourDuration = parseInt(match[0]);
    }
    if ($(el).find('.fa-map').length || text.toLowerCase().includes('mombasa') || 
        text.toLowerCase().includes('seychelles') || text.toLowerCase().includes('zanzibar')) {
      tourDestination = text;
    }
  });
  if (!tourDestination) {
    if (tourTitle.toLowerCase().includes('mombasa')) tourDestination = 'Mombasa, Kenya';
    else if (tourTitle.toLowerCase().includes('seychelles')) tourDestination = 'Seychelles';
    else if (tourTitle.toLowerCase().includes('zanzibar')) tourDestination = 'Zanzibar, Tanzania';
  }

  // Price
  let tourPrice = null;
  const priceCandidate = cleanText($('.page-title .inner-box h3').first().text().trim());
  if (priceCandidate) {
    tourPrice = parsePrice(priceCandidate);
  } else {
    const bodyText = cleanText($('body').text());
    const priceMatch = bodyText.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/) ||
                       bodyText.match(/(\d{1,3}(?:,\d{3})*)\s*Birr/i);
    if (priceMatch) {
      tourPrice = parsePrice(priceMatch[0]);
    }
  }

  // Image URL
  let imageUrl = null;
  const bgStyle = $('section.page-title.style-three').attr('style');
  if (bgStyle) {
    const match = bgStyle.match(/url\(['"]?(.*?)['"]?\)/);
    if (match) imageUrl = match[1];
  }
  if (!imageUrl) {
    const img = $('img').first().attr('src');
    if (img) imageUrl = img;
  }

  // Included / Excluded (clean each item)
  const included = [];
  $('.overview-inner .included-list li').each((i, el) => {
    let text = cleanText($(el).text().trim());
    if (text) included.push(text);
  });
  const excluded = [];
  $('.overview-inner .excluded-list li').each((i, el) => {
    let text = cleanText($(el).text().trim());
    if (text) excluded.push(text);
  });

  // Tour Plan Days
  const tourPlanDays = [];
  $('.tour-plan .content-box .single-box').each((idx, dayEl) => {
    const daySpan = cleanText($(dayEl).find('span').first().text().trim());
    let dayNumber = null;
    if (daySpan) {
      const numMatch = daySpan.match(/\d+/);
      if (numMatch) dayNumber = parseInt(numMatch[0]);
    }
    if (!dayNumber) dayNumber = idx + 1;

    const title = cleanText($(dayEl).find('h3').first().text().trim()) || `Day ${dayNumber}`;
    let description = cleanText($(dayEl).find('p').first().text().trim());
    if (!description) description = null;

    const items = [];
    $(dayEl).find('ul.list li').each((i, li) => {
      let itemText = cleanText($(li).text().trim());
      if (itemText) items.push(itemText);
    });
    $(dayEl).find('ul.list ul li').each((i, li) => {
      let itemText = cleanText($(li).text().trim());
      if (itemText) items.push(itemText);
    });

    tourPlanDays.push({
      dayNumber,
      title,
      description,
      items,
      boldtext: null,
    });
  });

  // Slug URL
  const relativePath = path.relative(TOURS_DIR, filePath);
  let slugUrl = relativePath.replace(/\\/g, '/').replace('.html', '').toLowerCase();
  slugUrl = slugUrl.replace(/[^a-z0-9/-]/g, '-');

  return {
    slugUrl,
    imageUrl,
    tourTitle,
    tourDescription,
    tourDuration,
    tourDestination,
    tourPrice,
    isPublished: true,
    included,
    excluded,
    tourDocumentUrl: null,
    tourPlanDays,
  };
}

// Parse tour-detail.js mock data (Greece)
async function extractFromTourDetailJs(filePath) {
  const jsContent = await fs.readFile(filePath, 'utf8');
  const regex = /var\s+\$tour\s*=\s*(\{[\s\S]*?\n\});/;
  const match = jsContent.match(regex);
  if (!match) throw new Error('Could not find $tour object in tour-detail.js');

  const tourObj = eval('(' + match[1] + ')');

  const slugUrl = tourObj.id || tourObj.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const imageUrl = tourObj['image-bg'] || null;
  const tourTitle = cleanText(tourObj.title);
  const tourDescription = cleanText(tourObj.overview);
  const tourDuration = tourObj.durationDays || tourObj.days || null;
  const tourDestination = cleanText(tourObj.location);
  let tourPrice = null;
  if (tourObj.price) {
    tourPrice = parsePrice(tourObj.price);
  }

  const included = (tourObj.included || []).map(i => cleanText(i)).filter(Boolean);
  const excluded = (tourObj.excluded || []).map(i => cleanText(i)).filter(Boolean);
  const tourDocumentUrl = tourObj.download?.url || null;

  const tourPlanDays = (tourObj.tourPlan || []).map(day => ({
    dayNumber: day.dayNumber,
    title: cleanText(day.title),
    description: cleanText(day.description),
    items: (day.items || []).map(i => cleanText(i)).filter(Boolean),
    boldtext: cleanText(day.boldtext),
  }));

  return {
    slugUrl,
    imageUrl,
    tourTitle,
    tourDescription,
    tourDuration,
    tourDestination,
    tourPrice,
    isPublished: true,
    included,
    excluded,
    tourDocumentUrl,
    tourPlanDays,
  };
}

// Main
async function extractAllTours() {
  const tours = [];

  // Static HTML tours
  try {
    const files = await fs.readdir(TOURS_DIR);
    const htmlFiles = files.filter(f => f.endsWith('.html') && f !== 'ethiopia.html');
    for (const file of htmlFiles) {
      const filePath = path.join(TOURS_DIR, file);
      console.log(`Processing static HTML: ${file}`);
      const tour = await extractFromHtmlFile(filePath);
      if (tour) {
        tours.push(tour);
        console.log(`  -> Extracted: ${tour.tourTitle}`);
      } else {
        console.log(`  -> Skipped (no title): ${file}`);
      }
    }
  } catch (err) {
    console.warn(`Could not read tours directory: ${err.message}`);
  }

  // Mock data from tour-detail.js
  try {
    console.log(`Processing mock data from: ${TOUR_DETAIL_JS}`);
    const mockTour = await extractFromTourDetailJs(TOUR_DETAIL_JS);
    tours.push(mockTour);
    console.log(`  -> Extracted: ${mockTour.tourTitle}`);
  } catch (err) {
    console.warn(`Could not process tour-detail.js: ${err.message}`);
  }

  await fs.writeFile(OUTPUT_FILE, JSON.stringify(tours, null, 2));
  console.log(`\n✅ Extracted ${tours.length} tours. Saved to ${OUTPUT_FILE}`);
  return tours;
}

if (require.main === module) {
  extractAllTours().catch(err => {
    console.error('Extraction failed:', err);
    process.exit(1);
  });
}

module.exports = { extractAllTours };