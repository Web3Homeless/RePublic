// pages/api/github/webhook.ts

import { NextApiRequest, NextApiResponse } from "next";
import { Webhooks, createNodeMiddleware } from "@octokit/webhooks";
import { Octokit } from "@octokit/rest";
import { NextRequest } from "next/server";
import { createAppAuth } from "@octokit/auth-app";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import { db } from "~/server/db";

export async function getInstallationAccessToken(installationId: number) {
  const privateKeyPath = process.env.PRIVATE_KEY_PATH;
  const filePath = path.join(process.cwd(), privateKeyPath!);
  const privateKey = fs.readFileSync(filePath, "utf8");

  console.log("DEFAULT AUTH");

  const auth = createAppAuth({
    appId: process.env.APP_ID!,
    privateKey: privateKey,
  });

  console.log("INSTALLATION AUTH", installationId);

  const installationAuthentication = await auth({
    type: "installation",
    installationId: installationId,
  });

  console.log("INSTALLATION TOKEN", installationAuthentication);

  return installationAuthentication;
}

const webhooks = new Webhooks({
  secret: process.env.WEBHOOK_SECRET!,
  // Your secret that you set when creating the GitHub App
});

webhooks.on("installation", async ({ id, name, payload }) => {
  console.log(name, "event received");
  console.log(payload);
  //console.log("payload received", payload);

  // const token = await getInstallationAccessToken(
  //   Number.parseInt(payload.installation.id.toString()),
  // );
  // const octokit = new Octokit({
  //   auth: token,
  // });

  const ab = await db.githubInstallation.findFirst({
    where: {
      installation_id: payload.installation.id.toString(),
    },
  });

  console.log(ab);

  if (ab == null) {
    console.log("CREATING NEW INSTALLATION");

    const gg = await db.githubInstallation.create({
      data: {
        installation_id: payload.installation.id.toString(),
        user_id: payload.sender.id.toString(),
      },
    });

    console.log("CREATED");
  }
});

webhooks.on("pull_request", async ({ id, name, payload }) => {
  console.log(name, "event received");
  //console.log("payload received", payload);

  const token = await getInstallationAccessToken(
    Number.parseInt(payload.installation!.id as string),
  );
  const octokit = new Octokit({
    auth: token,
  });

  try {
    // await octokit.rest.issues.createComment({
    //   owner: payload.repository.owner.login,
    //   repo: payload.repository.name,
    //   issue_number: payload.pull_request.number,
    //   body: "Test message",
    // });

    console.log(payload.repository.clone_url);
    console.log(payload.repository.full_name);
    console.log(payload.repository.name);
    console.log(payload.repository.owner.login);

    await downloadRepository(
      payload.repository.owner.login,
      payload.repository.name,
      octokit,
    );
  } catch (error) {
    if (error.response) {
      console.error(
        `Error! Status: ${error.response.status}. Message: ${error.response.data.message}`,
      );
    } else {
      console.error(error);
    }
  }
});

async function downloadRepository(
  owner: string,
  repo: string,
  octokit: Octokit,
) {
  const response = await octokit.repos.downloadZipballArchive({
    owner: owner,
    repo: repo,
    ref: "master",
  });

  console.log(response);

  // Check if the response has a URL property
  if (response.url) {
    // Fetching the zip file from the URL
    const res = await fetch(response.url);
    if (res.ok) {
      // Stream the response into a file
      const fileStream = fs.createWriteStream(`${repo}.zip`);
      res.body.pipe(fileStream);
      fileStream.on("finish", () => {
        console.log(`${repo}.zip has been downloaded.`);
      });
    } else {
      console.log("Failed to download the zip file.");
    }
  } else {
    console.log("No URL provided for the repository zip file.");
  }

  console.log(`${repo}.zip has been downloaded.`);
}

export async function POST(req: NextRequest) {
  console.log("Request", req);

  const signature = req.headers.get("x-hub-signature-256");
  const event = req.headers.get("x-github-event");
  const id = req.headers.get("x-github-delivery");

  // Verify the presence of required headers
  if (!signature || !event || !id) {
    console.log("Not headers");
    return new Response(
      JSON.stringify({ error: "Missing necessary headers" }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  // Get the raw body for signature verification
  const body = await req.text();
  const isValidSignature = await webhooks.verify(body, signature);

  if (!isValidSignature) {
    console.log("Not valid");
    return new Response(
      JSON.stringify({ error: "Failed to verify signature" }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  // Process the verified webhook
  try {
    console.log("Try payload", event);
    //const payload = JSON.parse(body);

    await webhooks.verifyAndReceive({
      id: id,
      name: event,
      signature: signature,
      payload: body,
    });

    console.log("Verified payload");

    return new Response(
      JSON.stringify({ message: "Webhook received and processed" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
