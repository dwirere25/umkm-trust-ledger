let transactions =
    JSON.parse(localStorage.getItem("transactions")) || [];

let blockchain =
    JSON.parse(localStorage.getItem("blockchain")) || [];


function saveData() {

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );

    localStorage.setItem(
        "blockchain",
        JSON.stringify(blockchain)
    );
}


function formatRupiah(number) {

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }
    ).format(number);

}


function addTransaction() {

    const description =
        document.getElementById("description").value;

    const amount =
        Number(
            document.getElementById("amount").value
        );

    const type =
        document.getElementById("type").value;

    const method =
        document.getElementById("method").value;


    if (!description || !amount) {

        alert("Lengkapi data transaksi.");

        return;

    }


    const transaction = {

        id: Date.now(),

        description,

        amount,

        type,

        method,

        timestamp:
            new Date().toISOString(),

        verified: false

    };


    transactions.push(transaction);

    saveData();

    render();

    document.getElementById("description").value = "";

    document.getElementById("amount").value = "";

}


function calculateHash(data) {

    let hash = 0;

    const text =
        JSON.stringify(data);

    for (let i = 0; i < text.length; i++) {

        hash =
            ((hash << 5) - hash)
            + text.charCodeAt(i);

        hash |= 0;

    }


    return Math.abs(hash)
        .toString(16)
        .toUpperCase()
        .padStart(8, "0");

}


function verifyAll() {

    const unverified =
        transactions.filter(
            transaction =>
                !transaction.verified
        );


    if (unverified.length === 0) {

        alert(
            "Semua transaksi sudah diverifikasi."
        );

        return;

    }


    unverified.forEach(transaction => {

        const previousBlock =
            blockchain.length > 0
                ? blockchain[blockchain.length - 1].hash
                : "GENESIS";


        const blockData = {

            transactionId:
                transaction.id,

            description:
                transaction.description,

            amount:
                transaction.amount,

            type:
                transaction.type,

            method:
                transaction.method,

            timestamp:
                transaction.timestamp,

            previousHash:
                previousBlock

        };


        const hash =
            calculateHash(blockData);


        blockchain.push({

            index:
                blockchain.length,

            timestamp:
                new Date().toISOString(),

            data:
                blockData,

            previousHash:
                previousBlock,

            hash:

                hash

        });


        transaction.verified = true;

    });


    saveData();

    render();

    alert(
        "Data berhasil diverifikasi dan dicatat ke Trust Ledger."
    );

}


function render() {

    renderTransactions();

    renderBlockchain();

    updateDashboard();

}


function renderTransactions() {

    const container =
        document.getElementById(
            "transactionList"
        );


    if (transactions.length === 0) {

        container.innerHTML =
            '<p class="empty">Belum ada transaksi.</p>';

        return;

    }


    container.innerHTML = "";


    transactions
        .slice()
        .reverse()
        .forEach(transaction => {

            const div =
                document.createElement("div");

            div.className =
                "transaction";


            div.innerHTML = `

                <div class="transaction-info">

                    <strong>
                        ${transaction.description}
                    </strong>

                    <small>
                        ${transaction.method}
                        ·
                        ${new Date(
                            transaction.timestamp
                        ).toLocaleString("id-ID")}
                    </small>

                </div>


                <div>

                    <strong class="${
                        transaction.type
                    }">

                        ${
                            transaction.type === "income"
                                ? "+"
                                : "-"
                        }

                        ${formatRupiah(
                            transaction.amount
                        )}

                    </strong>


                    ${
                        transaction.verified

                        ?

                        '<div class="verified-label">✓ Verified</div>'

                        :

                        ""
                    }

                </div>

            `;


            container.appendChild(div);

        });

}


function renderBlockchain() {

    const container =
        document.getElementById(
            "blockchainList"
        );


    if (blockchain.length === 0) {

        container.innerHTML =
            '<p class="empty">Belum ada data terverifikasi.</p>';

        return;

    }


    container.innerHTML = "";


    blockchain
        .slice()
        .reverse()
        .forEach(block => {

            const div =
                document.createElement("div");

            div.className = "block";


            div.innerHTML = `

                <strong>
                    Block #${block.index}
                </strong>

                <div class="hash">

                    Hash:
                    ${block.hash}

                </div>

                <div class="hash">

                    Previous Hash:
                    ${block.previousHash}

                </div>

                <p style="margin-top:10px">

                    ${block.data.description}

                </p>

                <span class="verified-label">

                    ✓ Data Verified

                </span>

            `;


            container.appendChild(div);

        });

}


function updateDashboard() {

    let income = 0;

    let expense = 0;


    transactions.forEach(transaction => {

        if (transaction.type === "income") {

            income += transaction.amount;

        }

        else {

            expense += transaction.amount;

        }

    });


    document.getElementById("income")
        .textContent =
        formatRupiah(income);


    document.getElementById("expense")
        .textContent =
        formatRupiah(expense);


    document.getElementById("balance")
        .textContent =
        formatRupiah(
            income - expense
        );


    document.getElementById("verifiedCount")
        .textContent =
        blockchain.length;

}


function shareWhatsApp() {

    const text =

        `🔐 UMKM TRUST LEDGER

Sistem pencatatan digital UMKM
dengan mekanisme verifikasi berbasis blockchain.

📊 Rekam usaha:
${transactions.length} transaksi

🔗 Verified records:
${blockchain.length}

Lihat prototype:
${window.location.href}`;


    const url =
        "https://wa.me/?text="
        +
        encodeURIComponent(text);


    window.open(url, "_blank");

}


render();