import fs from "fs";
import path from "path";
import unzipper from "unzipper";

export async function outlineExportStart(
  outlineUrl: string,
  outlineApikey: string,
  outlineCollectionid: string
) {
  const response = await fetch(outlineUrl + "/api/collections.export", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + outlineApikey,
    },
    body: JSON.stringify({
      id: outlineCollectionid,
      format: "outline-markdown",
    }),
  });
  const data = await response.json();
  return data;
}

export async function outlineExportStatus(
  outlineUrl: string,
  outlineApikey: string,
  id: string,
  delay: number
) {
  const DelayMs = delay + 1000;

  await new Promise((resolve) => setTimeout(resolve, DelayMs));

  const response = await fetch(outlineUrl + "/api/fileOperations.info", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + outlineApikey,
    },
    body: JSON.stringify({ id: id }),
  });

  const data = await response.json();
  if (data.data.state === "complete") {
    return data;
  } else {
    outlineExportStatus(outlineUrl, outlineApikey, id, delay);
  }
}

export async function outlineDownloadArchive(
  outlineUrl: string,
  outlineApikey: string,
  id: string
) {
  const response = await fetch(
    outlineUrl + "/api/fileOperations.redirect?id=" + id,
    {
      method: "GET",
      headers: {
        Authorization: "Bearer " + outlineApikey,
      },
    }
  );

  const buffer = await response.arrayBuffer();
  //create tmp directory if not exists
  fs.mkdirSync(path.join(process.cwd(), "temp"), { recursive: true });

  const filePath = path.join(process.cwd(), "temp", `download.zip`);
  fs.writeFileSync(filePath, Buffer.from(buffer));

  return filePath;
}

export async function outlineExtractArchive() {
  const directory = await unzipper.Open.file("temp/download.zip");
  await directory.extract({ path: "temp" });
  return directory;
}

export async function outlineCleanExport(id: string, outlineUrl: string, outlineApikey: string) {

  const response = await fetch(
    outlineUrl + "/api/fileOperations.delete",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + outlineApikey,
      },
      body: JSON.stringify({ id: id }),
    }
  );
  console.log(response);
  if (response.status != 200) {
    return { success: false, message: "Could not find provided fileid." };
  }


  const tempPath = path.join(process.cwd(), "temp");
  const filePath = path.join(tempPath, `download_${id}.zip`);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  if (fs.existsSync(tempPath)) {
    fs.rmSync(tempPath, { recursive: true, force: true });
  }

  return { success: true, message: "Cleanup completed successfully." };
}


