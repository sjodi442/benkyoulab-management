<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { tick } from 'svelte';
	import type { PageData } from './$types';

	let { data, form }: { data: PageData; form: any } = $props();
	let statusFilter = $state($page.url.searchParams.get('status') || '');
	let payModal = $state<any>(null);
	let deleteModal = $state<any>(null);
	let printingInvoice = $state<any>(null);
	let loading = $state(false);

	function applyFilters() {
		const params = new URLSearchParams();
		if (statusFilter) params.set('status', statusFilter);
		goto(`/payments?${params.toString()}`, { replaceState: true });
	}

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
	}

	function formatDate(dateStr: string): string {
		try {
			return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(dateStr));
		} catch (e) {
			return dateStr;
		}
	}

	async function printInvoice(invoice: any) {
		printingInvoice = invoice;
		await tick();
		window.print();
		printingInvoice = null;
	}
</script>

<svelte:head>
	<title>Pembayaran - BenkyouLab</title>
</svelte:head>

<div class="space-y-6 no-print">
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
		<div>
			<h1 class="text-2xl font-bold text-surface-800 dark:text-white/95">Pembayaran & Invoice</h1>
			<p class="text-sm text-surface-800/50 dark:text-white/40 mt-0.5">{data.total} invoice</p>
		</div>
		<a href="/payments/new" class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-medium rounded-xl hover:from-primary-400 hover:to-primary-500 shadow-lg shadow-primary-500/25 transition-all hover:-translate-y-0.5">
			<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
			Buat Invoice
		</a>
	</div>

	<div class="flex gap-3">
		<select bind:value={statusFilter} onchange={applyFilters} class="px-3 py-2.5 bg-white dark:bg-surface-900/50 border border-surface-200 dark:border-white/10 rounded-xl text-sm text-surface-800 dark:text-white/80 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all cursor-pointer">
			<option value="">Semua Status</option>
			<option value="pending">Belum Bayar</option>
			<option value="paid">Lunas</option>
			<option value="overdue">Jatuh Tempo</option>
		</select>
	</div>

	<div class="bg-white dark:bg-surface-900/50 rounded-2xl border border-surface-200 dark:border-white/5 overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full">
				<thead>
					<tr class="border-b border-surface-200 dark:border-white/5">
						<th class="text-left px-5 py-3 text-xs font-semibold text-surface-800/50 dark:text-white/40 uppercase tracking-wider">Siswa</th>
						<th class="text-left px-5 py-3 text-xs font-semibold text-surface-800/50 dark:text-white/40 uppercase tracking-wider hidden sm:table-cell">Periode</th>
						<th class="text-right px-5 py-3 text-xs font-semibold text-surface-800/50 dark:text-white/40 uppercase tracking-wider">Jumlah</th>
						<th class="text-center px-5 py-3 text-xs font-semibold text-surface-800/50 dark:text-white/40 uppercase tracking-wider hidden md:table-cell">Jatuh Tempo</th>
						<th class="text-center px-5 py-3 text-xs font-semibold text-surface-800/50 dark:text-white/40 uppercase tracking-wider">Status</th>
						<th class="text-right px-5 py-3 text-xs font-semibold text-surface-800/50 dark:text-white/40 uppercase tracking-wider">Aksi</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-surface-200 dark:divide-white/5">
					{#each data.invoices as invoice}
						{@const paid = invoice.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0}
						<tr class="hover:bg-surface-50 dark:hover:bg-white/[0.02] transition-colors">
							<td class="px-5 py-3">
								<p class="text-sm font-medium text-surface-800 dark:text-white/90">{invoice.student?.user?.name}</p>
								<p class="text-xs text-surface-800/40 dark:text-white/30">{invoice.description || '-'}</p>
							</td>
							<td class="px-5 py-3 text-sm text-surface-800/60 dark:text-white/50 hidden sm:table-cell">{invoice.period}</td>
							<td class="px-5 py-3 text-right">
								<p class="text-sm font-semibold text-surface-800 dark:text-white/90">{formatCurrency(invoice.amount)}</p>
								{#if paid > 0 && paid < invoice.amount}
									<p class="text-xs text-emerald-500">Terbayar: {formatCurrency(paid)}</p>
								{/if}
							</td>
							<td class="px-5 py-3 text-center text-sm text-surface-800/60 dark:text-white/50 hidden md:table-cell">{formatDate(invoice.dueDate)}</td>
							<td class="px-5 py-3 text-center">
								<span class="px-2 py-0.5 text-xs font-medium rounded-full {invoice.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : invoice.status === 'overdue' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}">
									{invoice.status === 'paid' ? 'Lunas' : invoice.status === 'overdue' ? 'Jatuh Tempo' : 'Belum Bayar'}
								</span>
							</td>
							<td class="px-5 py-3 text-right border-none">
								<div class="flex items-center justify-end gap-1 border-none no-print">
									{#if invoice.status !== 'paid'}
										<button onclick={() => payModal = invoice} class="px-2.5 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition-colors cursor-pointer">
											Konfirmasi Bayar
										</button>
									{/if}
									<button onclick={() => printInvoice(invoice)} class="p-1.5 rounded-lg text-surface-800/40 dark:text-white/30 hover:text-primary-500 hover:bg-primary-500/5 transition-all cursor-pointer" title="Print">
										<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" /></svg>
									</button>
									<button onclick={() => deleteModal = invoice} class="p-1.5 rounded-lg text-red-500/40 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer" title="Hapus">
										<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
									</button>
								</div>
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan="6" class="px-5 py-16 text-center">
								<p class="text-surface-800/40 dark:text-white/30 text-sm">Belum ada invoice</p>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>

<!-- Payment confirmation modal -->
{#if payModal}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print" role="dialog">
		<div class="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-white/10 w-full max-w-md p-6 animate-slide-up shadow-2xl">
			<h3 class="text-lg font-semibold text-surface-800 dark:text-white/95 mb-4">Konfirmasi Pembayaran</h3>
			<p class="text-sm text-surface-800/60 dark:text-white/50 mb-4">
				Konfirmasi pembayaran untuk <strong>{payModal.student?.user?.name}</strong> sebesar <strong>{formatCurrency(payModal.amount)}</strong>
			</p>

			{#if form?.error}
				<div class="p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs">
					{form.error}
				</div>
			{/if}

			<form
				method="POST"
				action="?/pay"
				use:enhance={() => {
					loading = true;
					return async ({ result, update }) => {
						loading = false;
						if (result.type === 'success') {
							payModal = null;
						}
						await update();
					};
				}}
			>
				<input type="hidden" name="invoiceId" value={payModal.id} />
				<input type="hidden" name="amount" value={payModal.amount} />

				<div class="space-y-4">
					<div>
						<label for="paymentMethod" class="block text-sm font-medium text-surface-800/70 dark:text-white/60 mb-1.5">Metode Pembayaran</label>
						<select id="paymentMethod" name="paymentMethod" required class="w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-white/10 rounded-xl text-sm cursor-pointer">
							<option value="transfer">Transfer Bank</option>
							<option value="cash">Tunai</option>
							<option value="ewallet">E-Wallet</option>
						</select>
					</div>
					<div>
						<label for="payNotes" class="block text-sm font-medium text-surface-800/70 dark:text-white/60 mb-1.5">Catatan</label>
						<textarea id="payNotes" name="notes" rows="2" class="w-full px-4 py-2.5 bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-white/10 rounded-xl text-sm resize-none"></textarea>
					</div>
				</div>

				<div class="flex items-center justify-end gap-3 mt-5">
					<button type="button" onclick={() => payModal = null} class="px-4 py-2 text-sm text-surface-800/60 dark:text-white/50 cursor-pointer" disabled={loading}>Batal</button>
					<button type="submit" class="px-5 py-2.5 bg-emerald-500 text-white text-sm font-medium rounded-xl hover:bg-emerald-400 transition-colors cursor-pointer disabled:opacity-50" disabled={loading}>
						{loading ? 'Memproses...' : 'Konfirmasi Pembayaran'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

{#if deleteModal}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print" role="dialog">
		<div class="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-white/10 w-full max-w-md p-6 animate-slide-up shadow-2xl">
			<div class="flex items-center gap-3 text-red-500 mb-4">
				<div class="p-2 bg-red-500/10 rounded-full">
					<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
				</div>
				<h3 class="text-lg font-semibold text-surface-800 dark:text-white/95">Hapus Invoice?</h3>
			</div>
			
			<p class="text-sm text-surface-800/60 dark:text-white/50 mb-6">
				Anda akan menghapus invoice untuk <strong>{deleteModal.student?.user?.name}</strong> periode <strong>{deleteModal.period}</strong>.
				<span class="block mt-2 text-red-500 font-medium font-mono text-[11px] p-2 bg-red-50 rounded-lg">
					PERINGATAN: Semua data pembayaran terkait invoice ini juga akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
				</span>
			</p>

			<form
				method="POST"
				action="?/delete"
				use:enhance={() => {
					loading = true;
					return async ({ result, update }) => {
						loading = false;
						if (result.type === 'success') {
							deleteModal = null;
						}
						await update();
					};
				}}
			>
				<input type="hidden" name="id" value={deleteModal.id} />

				<div class="flex items-center justify-end gap-3">
					<button type="button" onclick={() => deleteModal = null} class="px-4 py-2 text-sm text-surface-800/60 dark:text-white/50 cursor-pointer" disabled={loading}>Batal</button>
					<button type="submit" class="px-5 py-2.5 bg-red-500 text-white text-sm font-medium rounded-xl hover:bg-red-400 transition-colors cursor-pointer disabled:opacity-50" disabled={loading}>
						{loading ? 'Menghapus...' : 'Ya, Hapus Permanen'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Printable Template -->
<div class="hidden print-only">
	{#if printingInvoice}
		<div class="p-8 max-w-4xl mx-auto bg-white text-black font-sans invoice-container">
			<!-- Header -->
			<div class="flex justify-between items-start border-b-2 border-surface-900 pb-6 mb-8">
				<div>
					<h1 class="text-3xl font-bold tracking-tighter">BENKYOULAB</h1>
					<p class="text-sm font-medium">勉強ラボ • Kursus Bahasa Jepang</p>
					<p class="text-xs text-gray-500 mt-1">Online & Offline Japanese Learning</p>
				</div>
				<div class="text-right">
					<h2 class="text-xl font-bold uppercase tracking-widest text-gray-400">
						{printingInvoice.status === 'paid' ? 'BUKTI PEMBAYARAN' : 'TAGIHAN BELAJAR'}
					</h2>
					<p class="text-sm font-mono mt-1">REF: #{printingInvoice.id.slice(0, 8).toUpperCase()}</p>
				</div>
			</div>

			<!-- Details -->
			<div class="grid grid-cols-2 gap-8 mb-10">
				<div>
					<h3 class="text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">DITUJUKAN KEPADA:</h3>
					<p class="text-lg font-bold">{printingInvoice.student?.user?.name}</p>
					<p class="text-sm text-gray-600">{printingInvoice.student?.user?.email || '-'}</p>
				</div>
				<div class="text-right inline-grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
					<span class="text-gray-400 font-bold uppercase text-xs">Tanggal:</span>
					<span class="font-medium">{formatDate(new Date().toISOString())}</span>
					<span class="text-gray-400 font-bold uppercase text-xs">Jatuh Tempo:</span>
					<span class="font-medium">{formatDate(printingInvoice.dueDate)}</span>
				</div>
			</div>

			<!-- Table -->
			<table class="w-full mb-10">
				<thead>
					<tr class="border-b-2 border-black">
						<th class="text-left py-3 text-xs font-bold uppercase tracking-widest">Deskripsi Layanan</th>
						<th class="text-center py-3 text-xs font-bold uppercase tracking-widest">Periode</th>
						<th class="text-right py-3 text-xs font-bold uppercase tracking-widest">Jumlah</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100">
					<tr>
						<td class="py-6">
							<p class="font-bold text-lg">Biaya Kursus Bahasa Jepang</p>
							<p class="text-sm text-gray-500 mt-1">{printingInvoice.description || 'Pembayaran biaya kursus bulanan BenkyouLab'}</p>
						</td>
						<td class="py-6 text-center font-medium">{printingInvoice.period}</td>
						<td class="py-6 text-right font-bold text-lg">{formatCurrency(printingInvoice.amount)}</td>
					</tr>
				</tbody>
				<tfoot>
					<tr class="border-t-2 border-black">
						<td colspan="2" class="py-6 text-right text-xs font-bold uppercase tracking-widest">Total Bayar</td>
						<td class="py-6 text-right text-2xl font-black">{formatCurrency(printingInvoice.amount)}</td>
					</tr>
				</tfoot>
			</table>

			{#if printingInvoice.status === 'paid'}
				<!-- Receipt Specific Status -->
				<div class="relative bg-emerald-50 border-2 border-emerald-500 rounded-3xl p-8 overflow-hidden mb-12">
					<div class="absolute -right-8 -bottom-8 opacity-10">
						<svg class="w-48 h-48 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
							<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
						</svg>
					</div>
					<div class="flex items-center gap-6">
						<div class="bg-emerald-500 text-white p-3 rounded-full shadow-lg shadow-emerald-500/20">
							<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
								<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
							</svg>
						</div>
						<div>
							<h4 class="font-black text-emerald-900 uppercase tracking-widest text-2xl">PEMBAYARAN LUNAS</h4>
							<p class="text-emerald-700 font-medium mt-1">Terverifikasi secara elektronik oleh sistem BenkyouLab</p>
						</div>
					</div>

					<div class="mt-8 pt-8 border-t border-emerald-200/50 grid grid-cols-2 gap-4 text-sm font-medium text-emerald-800">
						<div>
							<span class="text-emerald-600/60 uppercase text-[10px] font-bold block mb-1">Metode:</span>
							{printingInvoice.payments?.[0]?.paymentMethod?.toUpperCase() || 'TRANSFER'}
						</div>
						<div class="text-right">
							<span class="text-emerald-600/60 uppercase text-[10px] font-bold block mb-1">ID Transaksi:</span>
							{printingInvoice.payments?.[0]?.id?.slice(0, 12).toUpperCase() || '-'}
						</div>
					</div>
				</div>
			{:else}
				<!-- Invoice Payment Instructions -->
				<div class="bg-gray-50 border-2 border-dashed border-gray-300 rounded-3xl p-8 mb-12">
					<h4 class="text-xs font-black text-gray-400 uppercase mb-4 tracking-widest">INSTRUKSI PEMBAYARAN:</h4>
					<div class="space-y-6 text-sm">
						<p class="text-gray-600">Mohon melakukan pembayaran sebelum tanggal jatuh tempo melalui transfer bank:</p>
						<div class="grid grid-cols-[120px_1fr] gap-x-4 gap-y-3 bg-white p-6 rounded-2xl border border-gray-200">
							<span class="text-gray-400 font-bold uppercase text-[10px]">Nama Bank:</span>
							<span class="font-bold text-lg">Bank Central Asia (BCA)</span>
							
							<span class="text-gray-400 font-bold uppercase text-[10px]">No. Rekening:</span>
							<span class="font-black text-2xl tracking-wider">123-456-7890</span>
							
							<span class="text-gray-400 font-bold uppercase text-[10px]">Atas Nama:</span>
							<span class="font-bold">BENKYOULAB MANAGEMENT</span>
						</div>
						<p class="text-xs text-gray-400 italic font-medium">
							*Pastikan nominal transfer sesuai dengan total tagihan. Bukti transfer dapat diunggah melalui dashboard atau dikirim via WhatsApp Admin.
						</p>
					</div>
				</div>
			{/if}

			<!-- Footer -->
			<div class="text-center mt-auto pt-10 border-t border-gray-100">
				<p class="text-lg italic font-bold text-surface-900">Arigatou Gozaimasu!</p>
				<p class="text-sm text-gray-500 mt-2">Terima kasih telah mempercayakan perjalanan belajar Bahasa Jepang Anda bersama BenkyouLab.</p>
				<div class="flex justify-center gap-6 mt-6">
					<span class="text-[10px] font-bold text-gray-300 tracking-[0.3em] uppercase">Connect With Us: @benkyoulab.official</span>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	@keyframes slide-up {
		from { opacity: 0; transform: translateY(12px); }
		to { opacity: 1; transform: translateY(0); }
	}
	.animate-slide-up {
		animation: slide-up 0.3s ease-out;
	}
</style>
