process.stdout.write("C:\\Game> ");

process.stdin.on("data", (data) => {
    const input = data.toString().trim();

    console.log("Ты ввёл:", input);

    process.stdout.write("C:\\Game> ");
});
