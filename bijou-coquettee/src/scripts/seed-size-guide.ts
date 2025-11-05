import SizeGuideModuleService from "../modules/size-guide/service"
import { SIZE_GUIDE_MODULE } from "../modules/size-guide"

/**
 * Seed Size Guide Data
 * Run with: npx medusa exec ./src/scripts/seed-size-guide.ts
 */
export default async function seedSizeGuide({ container }: any) {
    const sizeGuideModuleService: SizeGuideModuleService = container.resolve(SIZE_GUIDE_MODULE)

    console.log("🌱 Seeding size guide data...")

    // Ring Size Data (US to International Conversions)
    const ringSizes = [
        { us: "3", uk: "F", eu: "44", asia: "4", circumference: 44.2, diameter: 14.1, order: 1 },
        { us: "3.5", uk: "G", eu: "45", asia: "5", circumference: 45.5, diameter: 14.5, order: 2 },
        { us: "4", uk: "H", eu: "47", asia: "7", circumference: 46.8, diameter: 14.9, order: 3 },
        { us: "4.5", uk: "I", eu: "48", asia: "8", circumference: 48.0, diameter: 15.3, order: 4 },
        { us: "5", uk: "J", eu: "49", asia: "9", circumference: 49.3, diameter: 15.7, order: 5 },
        { us: "5.5", uk: "K", eu: "51", asia: "11", circumference: 50.6, diameter: 16.1, order: 6 },
        { us: "6", uk: "L", eu: "52", asia: "12", circumference: 51.9, diameter: 16.5, order: 7 },
        { us: "6.5", uk: "M", eu: "53", asia: "13", circumference: 53.1, diameter: 16.9, order: 8 },
        { us: "7", uk: "N", eu: "54", asia: "14", circumference: 54.4, diameter: 17.3, order: 9 },
        { us: "7.5", uk: "O", eu: "56", asia: "16", circumference: 55.7, diameter: 17.7, order: 10 },
        { us: "8", uk: "P", eu: "57", asia: "17", circumference: 57.0, diameter: 18.1, order: 11 },
        { us: "8.5", uk: "Q", eu: "58", asia: "18", circumference: 58.3, diameter: 18.5, order: 12 },
        { us: "9", uk: "R", eu: "59", asia: "19", circumference: 59.5, diameter: 19.0, order: 13 },
        { us: "9.5", uk: "S", eu: "61", asia: "20", circumference: 60.8, diameter: 19.4, order: 14 },
        { us: "10", uk: "T", eu: "62", asia: "21", circumference: 62.1, diameter: 19.8, order: 15 },
        { us: "10.5", uk: "U", eu: "63", asia: "23", circumference: 63.4, diameter: 20.2, order: 16 },
        { us: "11", uk: "V", eu: "64", asia: "24", circumference: 64.6, diameter: 20.6, order: 17 },
        { us: "11.5", uk: "W", eu: "66", asia: "25", circumference: 65.9, diameter: 21.0, order: 18 },
        { us: "12", uk: "X", eu: "67", asia: "26", circumference: 67.2, diameter: 21.4, order: 19 },
        { us: "12.5", uk: "Y", eu: "68", asia: "27", circumference: 68.5, diameter: 21.8, order: 20 },
        { us: "13", uk: "Z", eu: "69", asia: "28", circumference: 69.7, diameter: 22.2, order: 21 },
    ]

    for (const size of ringSizes) {
        await sizeGuideModuleService.createSizeGuides([{
            category: "ring",
            size_us: size.us,
            size_uk: size.uk,
            size_eu: size.eu,
            size_asia: size.asia,
            circumference_mm: size.circumference,
            diameter_mm: size.diameter,
            sort_order: size.order,
        }])
    }

    console.log(`✅ Created ${ringSizes.length} ring sizes`)

    // Necklace Length Guide
    const necklaceLengths = [
        { length: 35, description: "Choker - Sits close to the neck", order: 1 },
        { length: 40, description: "Princess - Falls just below the collarbone", order: 2 },
        { length: 45, description: "Matinee - Rests at the top of the bust", order: 3 },
        { length: 50, description: "Opera - Falls just above or at the bust", order: 4 },
        { length: 60, description: "Rope - Falls below the bust", order: 5 },
        { length: 90, description: "Lariat - Very long, can be wrapped multiple times", order: 6 },
    ]

    for (const length of necklaceLengths) {
        await sizeGuideModuleService.createSizeGuides([{
            category: "necklace",
            length_cm: length.length,
            description: length.description,
            sort_order: length.order,
        }])
    }

    console.log(`✅ Created ${necklaceLengths.length} necklace lengths`)

    // Bracelet Length Guide
    const braceletLengths = [
        { length: 15, description: "Extra Small - Very petite wrist", order: 1 },
        { length: 16.5, description: "Small - Petite wrist", order: 2 },
        { length: 18, description: "Medium - Average wrist", order: 3 },
        { length: 19, description: "Large - Larger wrist", order: 4 },
        { length: 20, description: "Extra Large - Very large wrist", order: 5 },
    ]

    for (const length of braceletLengths) {
        await sizeGuideModuleService.createSizeGuides([{
            category: "bracelet",
            length_cm: length.length,
            description: length.description,
            sort_order: length.order,
        }])
    }

    console.log(`✅ Created ${braceletLengths.length} bracelet lengths`)

    // Create Measurement Guides
    await sizeGuideModuleService.createMeasurementGuides([{
        category: "ring",
        title: "How to Measure Your Ring Size",
        instructions: `**Method 1: Use a Ring Sizer**
1. Order a free ring sizer from us or purchase one from a jewelry store
2. Try on different sizes until you find the perfect fit
3. The ring should slide over your knuckle with slight resistance
4. It should fit snugly but comfortably on your finger

**Method 2: Measure an Existing Ring**
1. Choose a ring that fits the desired finger perfectly
2. Measure the inside diameter of the ring in millimeters
3. Use our size chart to find your size based on the diameter
4. For best accuracy, measure multiple times

**Method 3: Measure Your Finger**
1. Wrap a thin strip of paper or string around your finger
2. Mark where the paper/string overlaps
3. Measure the length in millimeters (circumference)
4. Use our size chart to find your corresponding size

**Important Tips:**
- Measure at the end of the day when fingers are warmest
- Measure the finger you plan to wear the ring on
- If between sizes, choose the larger size
- Consider wider bands may require a half size larger`,
        tips: {
            items: [
                "Fingers change size throughout the day - measure when they're at their largest",
                "Temperature affects finger size - warm fingers are larger",
                "Measure the exact finger you'll wear the ring on (they vary!)",
                "If between sizes, size up for comfort",
                "Wide bands (over 8mm) may need a half size larger",
                "Consider having your size professionally measured at a jewelry store",
            ]
        } as any,
    }])

    await sizeGuideModuleService.createMeasurementGuides([{
        category: "necklace",
        title: "How to Choose Your Necklace Length",
        instructions: `**Finding Your Perfect Length:**

**Choker (35cm / 14")**: Sits high on the neck, just above the collarbone. Perfect for elegant, formal occasions.

**Princess (40-45cm / 16-18")**: The most popular length. Falls just below the collarbone and complements most necklines.

**Matinee (50-55cm / 20-22")**: Rests at the top of the bust. Ideal for business attire and higher necklines.

**Opera (60-70cm / 24-28")**: Falls at or below the bust. Perfect for formal events and can be doubled as a choker.

**Rope (80cm+ / 32"+)**: Very versatile length that can be worn long, doubled, or knotted. Makes a statement.

**How to Measure:**
1. Use a soft measuring tape or string
2. Wrap around your neck where you'd like the necklace to sit
3. Add 2-5cm for comfort and pendant space
4. Check our length descriptions to visualize the look`,
        tips: {
            items: [
                "Consider your neckline - higher necklines pair well with longer necklaces",
                "Pendant size affects length choice - larger pendants need longer chains",
                "Layer different lengths for a trendy stacked look",
                "Princess length (16-18\") is universally flattering",
                "Your height matters - petite frames suit shorter lengths",
            ]
        } as any,
    }])

    await sizeGuideModuleService.createMeasurementGuides([{
        category: "bracelet",
        title: "How to Measure Your Bracelet Size",
        instructions: `**Measuring Your Wrist:**

**Method 1: Use a Measuring Tape**
1. Wrap a flexible measuring tape around your wrist
2. Measure just above your wrist bone (where a bracelet would sit)
3. Note the measurement in centimeters
4. Add 2cm for a comfortable fit (1.5cm for snug, 2.5cm for loose)

**Method 2: Use String or Paper**
1. Wrap a piece of string or paper strip around your wrist
2. Mark where it overlaps
3. Measure the string/paper with a ruler in centimeters
4. Add 2cm for comfort

**Size Guidelines:**
- **Extra Small (15cm)**: Wrist circumference 12-13cm
- **Small (16.5cm)**: Wrist circumference 13.5-14.5cm
- **Medium (18cm)**: Wrist circumference 15-16cm
- **Large (19cm)**: Wrist circumference 16.5-17cm
- **Extra Large (20cm)**: Wrist circumference 17.5-18cm

**Bracelet Style Considerations:**
- **Bangles**: Should slide over your hand - measure the widest part
- **Chain bracelets**: Can be slightly looser for movement
- **Cuffs**: Should have about 2.5cm gap for easy wearing
- **Tennis bracelets**: Should fit snugly but not tight`,
        tips: {
            items: [
                "Measure your dominant hand as it's typically slightly larger",
                "Add 2cm to wrist measurement for comfort (1.5cm snug, 2.5cm loose)",
                "Bangles need to fit over your hand - measure at knuckles",
                "Consider bracelet style when choosing size",
                "If unsure, adjustable bracelets are a great option",
            ]
        } as any,
    }])

    console.log("✅ Created measurement guides for all categories")
    console.log("🎉 Size guide data seeding complete!")
}

