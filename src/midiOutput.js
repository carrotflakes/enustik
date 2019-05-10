export async function getDevices() {
  const data = await navigator.requestMIDIAccess();
  return [...data.outputs].map(x => x[1]);
}
