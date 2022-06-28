import { Component, AfterViewInit, OnInit, ViewChild } from '@angular/core';
import {ApiService} from "../../services/api.service";
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {Router} from "@angular/router";
import {CurrencyService} from "../../services/currency.service";

@Component({
  selector: 'app-coin-list',
  templateUrl: './coin-list.component.html',
  styleUrls: ['./coin-list.component.scss']
})
export class CoinListComponent implements OnInit {

  dataSource: MatTableDataSource<any>;
  displayedColumns: string[] = ['symbol', 'current_price', 'price_change_percentage_24h', 'market_cap'];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  bannerData: any = [];
  currency: string = 'USD';

  constructor(private _api: ApiService, private router: Router, private currencyService: CurrencyService) { }

  ngOnInit(): void {
    this.getAllData();
    this.getBannerData();
    this.currencyService.getCurrency().subscribe(
      (val) => {
        this.currency = val;
        this.getAllData();
        this.getBannerData();
      },
      (err) => {
        console.error(err);
      });
  }

  getBannerData(): void {
    this._api.getTrendingCurrency(this.currency).subscribe(
      (res) => {
        this.bannerData = res;
      },
      (err) => {
        console.error(err);
      });
  };

  getAllData(): void {
    this._api.getCurrency(this.currency).subscribe(
      (res) => {
        this.dataSource = new MatTableDataSource(res);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      (err) => {
        console.error(err);
      });
  };

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  };

  goToDetails(row: any): void {
    this.router.navigate(['coin-detail', row.id])
  }

}
