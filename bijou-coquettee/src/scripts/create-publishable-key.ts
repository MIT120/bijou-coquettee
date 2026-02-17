import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  createApiKeysWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
} from "@medusajs/medusa/core-flows"

export default async function createPublishableKey({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  try {
    logger.info("Creating publishable API key...")

    // Create the publishable API key
    const { result: publishableApiKeyResult } = await createApiKeysWorkflow(
      container
    ).run({
      input: {
        api_keys: [
          {
            title: "Storefront Key",
            type: "publishable",
            created_by: "",
          },
        ],
      },
    })

    const publishableApiKey = publishableApiKeyResult[0]

    if (!publishableApiKey) {
      throw new Error("Failed to create publishable API key")
    }

    // Try to link to default sales channel if it exists
    try {
      const { data: salesChannels } = await query.graph({
        entity: "sales_channel",
        fields: ["id", "name"],
        filters: {
          is_default: true,
        },
      })

      if (salesChannels && salesChannels.length > 0) {
        const defaultSalesChannel = salesChannels[0]
        await linkSalesChannelsToApiKeyWorkflow(container).run({
          input: {
            id: publishableApiKey.id,
            add: [defaultSalesChannel.id],
          },
        })
        logger.info(
          `Linked publishable key to sales channel: ${defaultSalesChannel.name}`
        )
      }
    } catch (error) {
      logger.warn(
        `Could not link to sales channel (this is optional). Error: ${error instanceof Error ? error.message : error}`
      )
    }

    // Output the key
    console.log("\n" + "=".repeat(60))
    console.log("✅ Publishable API Key Created Successfully!")
    console.log("=".repeat(60))
    console.log("\nKey ID:", publishableApiKey.id)
    console.log("Key Token:", publishableApiKey.token)
    console.log("\n" + "-".repeat(60))
    console.log("📋 Add this to your .env file:")
    console.log("-".repeat(60))
    console.log(`NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${publishableApiKey.token}`)
    console.log("\n" + "=".repeat(60) + "\n")

    logger.info("Publishable API key created successfully!")

    return publishableApiKey
  } catch (error) {
    logger.error("Error creating publishable API key:", error)
    throw error
  }
}




