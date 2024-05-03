import Swal from "sweetalert2";

//#region Sweet Alert
export const MySwal = Swal.mixin({
  heightAuto: false
});

export const ToastSuccess = Swal.mixin({
	icon: 'success',
	background: '#a5dc86',
	toast: true,
	position: 'top-right',
	iconColor: 'white',
	showConfirmButton: false,
	timer: 1500,
});

export const ToastWarning = Swal.mixin({
	icon: 'warning',
	background: '#f0ec0d',
	toast: true,
	position: 'top-right',
	iconColor: 'white',
	showConfirmButton: false,
	timer: 1500,
});

export const ToastError = Swal.mixin({
	icon: 'error',
	background: '#f27474',
	toast: true,
	position: 'top-right',
	iconColor: 'white',
	showConfirmButton: false,
	timer: 1500,
});

export const ToastInfo = Swal.mixin({
	icon: 'info',
	background: '#0dcaf0',
	toast: true,
	position: 'top-right',
	iconColor: 'white',
	showConfirmButton: false,
	timer: 1500,
});

//#endregion